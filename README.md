# A Platform Game

A platform game based on [Dark Blue](http://www.lessmilk.com/game/dark-blue/) from [Eloquent JavaScript](http://eloquentjavascript.net/).<br>
The goal is to collect the coins while avoiding touching the lava. A level is completed when all coins have been collected.

## [Live Demo](https://rubychi.github.io/eloquentjs-a-platform-game)

You can see a complete working example [here](https://rubychi.github.io/eloquentjs-a-platform-game)

## Features

* Four difficulty levels
* The character has a total of three lives
* Move the character with the arrow keys

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
