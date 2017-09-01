let bgm = document.getElementById("bgm");
let sound = document.getElementById("sound");

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  plus(other) {
    return new Vector(this.x + other.x, this.y + other.y);
  }
  times(factor) {
    return new Vector(this.x * factor, this.y * factor);
  }
}

class Score {
  constructor(pos) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    this.type = "score";
  }
  type() {
    return this.type;
  }
  act() {}
}

class Lives {
  constructor(pos) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    this.type = "lives";
  }
  type() {
    return this.type;
  }
  act() {}
}

class Player {
  constructor(pos) {
    this.pos = pos.plus(new Vector(0, -0.5));
    this.size = new Vector(0.8, 1.5);
    this.speed = new Vector(0, 0);
    this.type = "player";
  }
  type() {
    return this.type;
  }
  moveX(step, level, keys) {
    let playerXSpeed = 7;
    this.speed.x = 0;
    if (keys.left) {
      this.speed.x -= playerXSpeed;
    }
    if (keys.right) {
      this.speed.x += playerXSpeed;
    }
    let motion = new Vector(this.speed.x * step, 0);
    let newPos = this.pos.plus(motion);
    let obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle) {
      level.playerTouched(obstacle);
    } else {
      this.pos = newPos;
    }
  }
  moveY(step, level, keys) {
    let gravity = 30;
    let jumpSpeed = 17;
    this.speed.y += step * gravity;
    let motion = new Vector(0, this.speed.y * step);
    let newPos = this.pos.plus(motion);
    let obstacle = level.obstacleAt(newPos, this.size);
    if (obstacle) {
      level.playerTouched(obstacle);
      if (keys.up && this.speed.y > 0) {
        sound.setAttribute("src", "assets/sound/smb_jump-small.wav");
        sound.play();
        this.speed.y -= jumpSpeed;
      } else {
        this.speed.y = 0;
      }
    } else {
      this.pos = newPos;
    }
  }
  act(step, level, keys) {
    this.moveX(step, level, keys);
    this.moveY(step, level, keys);
    let otherActor = level.actorAt(this);
    if (otherActor) {
      level.playerTouched(otherActor.type, otherActor);
    }
    // Losing animation
    if (level.status === "lost") {
      this.pos.y += step;
      this.size.y -= step;
    }
  }
}

class Lava {
  constructor(pos, ch) {
    this.pos = pos;
    this.size = new Vector(1, 1);
    this.type = "lava";
    if (ch == "=") {
      this.speed = new Vector(2, 0);
    } else if (ch == "|") {
      this.speed = new Vector(0, 2);
    } else if (ch == "v") {
      this.speed = new Vector(0, 3);
      this.repeatPos = pos;
    }
  }
  type() {
    return this.type;
  }
  act(step, level) {
    let newPos = this.pos.plus(this.speed.times(step));
    if (!level.obstacleAt(newPos, this.size)) {
      this.pos = newPos;
    } else if (this.repeatPos) {
      this.pos = this.repeatPos;
    } else {
      this.speed = this.speed.times(-1);
    }
  }
}

class Coin {
  constructor(pos) {
    this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
    this.size = new Vector(0.6, 0.6);
    this.wobble = Math.random() * Math.PI * 2;
    this.type = "coin";
  }
  type() {
    return this.type;
  }
  act(step) {
    let wobbleSpeed = 8;
    let wobbleDist = 0.07;
    this.wobble += step * wobbleSpeed;
    let wobblePos = Math.sin(this.wobble) * wobbleDist;
    this.pos = this.basePos.plus(new Vector(0, wobblePos));
  }
}

class Level {
  constructor(plan, lives) {
    this.width = plan[0].length;
    this.height = plan.length;
    this.grid = [];
    this.actors = [];
    this.zoomActors = [];
    this.status = this.finishDelay = null;
    this.lives = lives;
    let actorChars = {
      "@": Player,
      "o": Coin,
      "=": Lava,
      "|": Lava,
      "v": Lava,
    };
    for (let y = 0; y < this.height; y++) {
      let line = plan[y], gridLine = [];
      for (let x = 0; x < this.width; x++) {
        let ch = line[x], fieldType = null;
        let Actor = actorChars[ch];
        if (Actor) {
          this.actors.push(new Actor(new Vector(x, y), ch));
        } else if (ch == "x") {
          fieldType = "wall";
        } else if (ch == "!") {
          fieldType = "lava";
        }
        gridLine.push(fieldType);
      }
      this.grid.push(gridLine);
    }
    this.player = this.actors.filter(function(actor) {
      return actor.type == "player";
    })[0];
    this.coins = this.actors.filter(function(actor) {
      return actor.type == "coin";
    }).length;
    for (let i = 0, x = 0; i < lives; i++, x = x + 1.2) {
      this.zoomActors.push(new Lives(new Vector(x + 1, 1)));
    }
    this.zoomActors.push(new Score(new Vector(0, 1)));
  }
  // Overlaps with any nonempty space
  obstacleAt(pos, size) {
    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);

    if (xStart < 0 || xEnd > this.width || yStart < 0) {
      return "wall";
    } else if (yEnd > this.height) {
      return "lava";
    }
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let fieldType = this.grid[y][x];
        if (fieldType) {
          return fieldType;
        }
      }
    }
  }
  // Collisions between the player and other dynamic actors
  actorAt(actor) {
    for (let i = 0; i < this.actors.length; i++) {
      let other = this.actors[i];
      if (other !== actor &&
          actor.pos.x + actor.size.x > other.pos.x &&
          actor.pos.x < other.pos.x + other.size.x &&
          actor.pos.y + actor.size.y > other.pos.y &&
          actor.pos.y < other.pos.y + other.size.y) {
        return other;
      }
    }
  }
  animate(step, keys) {
    let maxStep = 0.05;
    if (this.status != null) {
      this.finishDelay -= step;
    }
    while (step > 0) {
      let thisStep = Math.min(step, maxStep);
      this.actors.forEach((actor) => {
        actor.act(thisStep, this, keys);
      });
      step -= thisStep;
    }
  }
  playerTouched(type, actor) {
    if (type === "lava" && this.status === null) {
      bgm.setAttribute("src", "assets/sound/smb_mariodie.wav");
      bgm.play();
      this.status = "lost";
      this.finishDelay = 1;
    } else if (type === "coin") {
      sound.setAttribute("src", "assets/sound/smb_coin.wav");
      sound.play();
      this.actors = this.actors.filter((other) => {
        return other !== actor;
      });
      if (!this.actors.some((actor) => {
        return actor.type === "coin";
      })) {
        bgm.setAttribute("src", "assets/sound/smb_stage_clear.wav");
        bgm.play();
        this.status = "won";
        this.finishDelay = 1;
      }
    }
  }
  isFinished() {
    return this.status !== null && this.finishDelay < 0;
  }
}

class DOMDisplay {
  constructor(parent, level) {
    this.scale = 30;
    this.wrap = parent.appendChild(this.elt("div", "game"));
    this.level = level;
    this.wrap.appendChild(this.drawBackground());
    this.actorLayer = null;
    this.drawFrame();
  }
  elt(name, className) {
    let elt = document.createElement(name);
    if (className) {
      elt.className = className;
    }
    return elt;
  }
  drawBackground() {
    let table = this.elt("table", "background");
    table.style.width = `${this.level.width * this.scale}px`;
    this.level.grid.forEach((row) => {
      let rowElt = table.appendChild(this.elt("tr"));
      rowElt.style.height = `${this.scale}px`;
      row.forEach((type) => {
        rowElt.appendChild(this.elt("td", type));
      });
    });
    return table;
  }
  drawActors() {
    let wrap = this.elt("div");
    this.level.actors.forEach((actor) => {
      let rect = wrap.appendChild(this.elt("div", `actor ${actor.type}`));
      rect.style.width = `${actor.size.x * this.scale}px`;
      rect.style.height = `${actor.size.y * this.scale}px`;
      rect.style.left = `${actor.pos.x * this.scale}px`;
      rect.style.top = `${actor.pos.y * this.scale}px`;
    });
    return wrap;
  }
  scrollPlayerIntoView() {
    let width = this.wrap.clientWidth;
    let height = this.wrap.clientHeight;
    let margin = width / 3;
    // The viewport
    let left = this.wrap.scrollLeft;
    let right = left + width;
    let top = this.wrap.scrollTop;
    let bottom = top + height;
    let player = this.level.player;
    let center = player.pos.plus(player.size.times(0.5)).times(this.scale);
    if (center.x < left + margin) {
      this.wrap.scrollLeft = center.x - margin;
    } else if (center.x > right - margin) {
      this.wrap.scrollLeft = center.x + margin - width;
    }
    if (center.y < top + margin) {
      this.wrap.scrollTop = center.y - margin;
    } else if (center.y > bottom - margin) {
      this.wrap.scrollTop = center.y + margin - height;
    }
  }
  drawZoomActors(wrap) {
    let width = this.wrap.clientWidth;
    let height = this.wrap.clientHeight;
    let left = this.wrap.scrollLeft;
    let right = left + width;
    let top = this.wrap.scrollTop;
    let bottom = top + height;
    this.level.zoomActors.forEach((actor) => {
      let rect = wrap.appendChild(this.elt("div", `actor ${actor.type}`));
      rect.style.width = `${actor.size.x * this.scale}px`;
      rect.style.height = `${actor.size.y * this.scale}px`;
      rect.style.left = `${actor.pos.x * this.scale + left}px`
      rect.style.top = `${actor.pos.y * this.scale + top}px`;
      if (actor.type === "score") {
        let collectedCoins = this.level.coins - this.level.actors.filter(function(actor) {
          return actor.type == "coin";
        }).length;
        rect.style.left = `${actor.pos.x * this.scale + right - width / 8}px`
        rect.innerHTML = `${collectedCoins}/${this.level.coins}`;
      }
    });
    return wrap;
  }
  drawFrame() {
    if (this.actorLayer) {
      this.wrap.removeChild(this.actorLayer);
    }
    this.actorLayer = this.wrap.appendChild(this.drawActors());
    this.wrap.className = `game ${this.level.status || ""}`;
    this.scrollPlayerIntoView();
    this.drawZoomActors(this.actorLayer);
  }
  clear() {
    this.wrap.parentNode.removeChild(this.wrap);
  }
}

class CanvasDisplay {
  constructor(parent, level) {
    this.scale = 20;
    this.canvas = document.createElement("canvas");
    this.canvas.width = Math.min(800, level.width * this.scale);
    this.canvas.height = Math.min(550, level.height * this.scale);
    parent.appendChild(this.canvas);
    this.cx = this.canvas.getContext("2d");

    this.level = level;
    this.animationTime = 0;
    this.flipPlayer = false;

    this.viewport = {
      left: 0,
      top: 0,
      width: this.canvas.width / this.scale,
      height: this.canvas.height / this.scale,
    };

    this.drawFrame(0);
  }
  updateViewport() {
    let view = this.viewport;
    let margin = view.width / 3;
    let player = this.level.player;
    let center = player.pos.plus(player.size.times(0.5));

    if (center.x < view.left + margin) {
      view.left = Math.max(center.x - margin, 0);
    } else if (center.x > view.left + view.width - margin) {
      view.left = Math.min(center.x + margin - view.width,
                           this.level.width - view.width);
    }
    if (center.y < view.top + margin) {
      view.top = Math.max(center.y - margin, 0);
    } else if (center.y > view.top + view.height - margin) {
      view.top = Math.min(center.y + margin - view.height,
                          this.level.height - view.height);
    }
  }
  clearDisplay() {
    if (this.level.status === "won") {
      this.cx.fillStyle = "rgb(68, 191, 255)";
    } else if (this.level.status === "lost") {
      this.cx.fillStyle = "rgb(44, 136, 214)";
    } else {
      this.cx.fillStyle = "rgb(52, 166, 251)";
    }
    this.cx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  drawBackground() {
    let otherSprites = document.createElement("img");
    otherSprites.src = "assets/img/sprites.png";
    let view = this.viewport;
    let xStart = Math.floor(view.left);
    let xEnd = Math.ceil(view.left + view.width);
    let yStart = Math.floor(view.top);
    let yEnd = Math.ceil(view.top + view.height);

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let tile = this.level.grid[y][x];
        if (tile === null) {
          continue;
        } else {
          let screenX = (x - view.left) * this.scale;
          let screenY = (y - view.top) * this.scale;
          let tileX = tile === "lava" ? this.scale : 0;
          this.cx.drawImage(otherSprites,
                            tileX, 0, this.scale, this.scale,
                            screenX, screenY, this.scale, this.scale);
        }
      }
    }
  }
  flipHorizontally(cx, around) {
    cx.translate(around, 0);
    cx.scale(-1, 1);
    cx.translate(-around, 0);
  }
  drawPlayer(x, y, width, height) {
    let playerSprites = document.createElement("img");
    playerSprites.src = "assets/img/player.png";
    let playerXOverlap = 4;

    let sprite = 8;
    let player = this.level.player;
    width += playerXOverlap * 2;
    x -= playerXOverlap;
    if (player.speed.x !== 0) {
      this.flipPlayer = player.speed.x < 0;
    }
    if (player.speed.y !== 0) {
      sprite = 9;
    } else if (player.speed.x !== 0) {
      sprite = Math.floor(this.animationTime * 12) % 8;
    }
    this.cx.save();
    if (this.flipPlayer) {
      this.flipHorizontally(this.cx, x + width / 2);
    }
    this.cx.drawImage(playerSprites,
                      sprite * width, 0, width, height,
                      x, y, width, height);
    this.cx.restore();
  }
  drawActors() {
    let otherSprites = document.createElement("img");
    otherSprites.src = "assets/img/sprites.png";
    this.level.actors.forEach((actor) => {
      let width = actor.size.x * this.scale;
      let height = actor.size.y * this.scale;
      let x = (actor.pos.x - this.viewport.left) * this.scale;
      let y = (actor.pos.y - this.viewport.top) * this.scale;
      if (actor.type === "player") {
        this.drawPlayer(x, y, width, height);
      } else {
        let tileX = (actor.type === "coin" ? 2 : 1) * this.scale;
        this.cx.drawImage(otherSprites,
                          tileX, 0, width, height,
                          x, y, width, height);
      }
    });
    this.level.zoomActors.forEach((actor) => {
      let width = actor.size.x * this.scale;
      let height = actor.size.y * this.scale;
      let x = actor.pos.x * this.scale;
      let y = actor.pos.y * this.scale;
      if (actor.type === "lives") {
        otherSprites.src = "assets/img/lives.png";
        this.cx.drawImage(otherSprites,
                          0, 0, width, height,
                          x, y, width, height);
      } else if (actor.type === "score") {
        let collectedCoins = this.level.coins - this.level.actors.filter(function(actor) {
          return actor.type == "coin";
        }).length;
        this.cx.font = "24px Monospace";
        this.cx.fillStyle = "white";
        this.cx.shadowColor = "lightgrey";
        this.cx.strokeText(`${collectedCoins}/${this.level.coins}`, x + this.cx.canvas.clientWidth - this.scale * 4, y + this.scale);
        this.cx.fillText(`${collectedCoins}/${this.level.coins}`, x + this.cx.canvas.clientWidth - this.scale * 4, y + this.scale);
      }
    });
  }
  drawFrame(step) {
    this.animationTime += step;

    this.updateViewport();
    this.clearDisplay();
    this.drawBackground();
    this.drawActors();
  }
  clear() {
    this.canvas.parentNode.removeChild(this.canvas);
  }
}

function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    let stop = false;
    if (lastTime !== null) {
      let timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop) {
      requestAnimationFrame(frame);
    }
  }
  requestAnimationFrame(frame);
}

function trackKeys(codes) {
  let pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      let down = event.type === "keydown";
      if (codes[event.keyCode] === "esc") {
        if (!down) {
          pressed["esc"] = !pressed["esc"];
        }
      } else {
        pressed[codes[event.keyCode]] = down;
      }
      event.preventDefault();
    }
  }
  addEventListener("keydown", handler);
  addEventListener("keyup", handler);
  return pressed;
}

function runLevel(level, Display, andThen) {
  let arrowCodes = {
    27: "esc",
    37: "left",
    38: "up",
    39: "right",
  };
  let arrows = trackKeys(arrowCodes);
  let display = new Display(document.body, level);
  runAnimation((step) => {
    if (!arrows.esc) {
      level.animate(step, arrows);
      display.drawFrame(step);
      if (level.isFinished()) {
        display.clear();
        if (andThen) {
          andThen(level.status);
        }
        return false;
      }
    }
  });
}

bgm.onended = function() {
    bgm.src= "assets/sound/201-overworld-bgm.mp3";
    bgm.play();
};

function runGame(plans, Display) {
  function startLevel(n, lives) {
    runLevel(new Level(plans[n], lives), Display, (status) => {
      if (status === "lost") {
        lives--;
        if (!lives) {
          bgm.setAttribute("src", "assets/sound/smb_gameover.wav");
          bgm.play();
          startLevel(0, 3);
        } else {
          startLevel(n, lives);
        }
      } else if (n < plans.length - 1) {
        startLevel(n + 1, lives);
      } else {
        bgm.setAttribute("src", "assets/sound/smb_world_clear.wav");
        bgm.play();
        startLevel(0, 3);
      }
    });
  }
  startLevel(0, 3);
}
