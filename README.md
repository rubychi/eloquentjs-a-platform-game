# A Platform Game

[![Known Vulnerabilities](https://snyk.io/test/github/rubychi/eloquentjs-a-platform-game/badge.svg)](https://snyk.io/test/github/rubychi/eloquentjs-a-platform-game)

A platform game based on [Dark Blue](http://www.lessmilk.com/game/dark-blue/) from [Eloquent JavaScript](http://eloquentjavascript.net/)

## [Live Demo](https://rubychi.github.io/eloquentjs-a-platform-game)

## Features

* Four levels, the goal is to collect coins while avoiding touching the lava
* The character has a total of three lives, the game starts over at level one if the player failed
* Move the character with the arrow keys
* Press ESC to pause/unpause the game

### Custom Features

* Add lives image
* Add text indicating number of coins collected in each level
* Add background music and sound effects (from Super Mario World Original Soundtrack)

### Upcoming

* Implement the ranking system
* Implement the level editor

## Getting Started

Follow the instructions below to set up the environment and run this project on your local machine

### Prerequisites

* Node.js

### Installing

1. Download ZIP or clone this repo
```
> git clone https://github.com/rubychi/eloquentjs-a-platform-game.git
```

2. Install dependencies via NPM
```
> npm install
```

3. Install gulp package globally to execute gulp command on your machine
```
> npm install gulp -g
```

4. Build the production version (all files will be put inside the folder "docs")
```
> gulp build
```

5. Navigate to the folder "docs" and open index.html

## Built With

### Frontend

* vanilla javascript

### Utils

* gulp
