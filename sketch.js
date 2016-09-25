"use strict";
const gameToRender = function createSketch(game) {
  
  // Global game constants.
  const mapWidth = 2000;
  const mapHeight = 2000;
  const viewWidth = 1000;
  const normalSpeed = 5;
  const boostedSpeed = 7;
  const brakeSpeed = 3;
  const dakWidth = 10;
  const dakHeight = 10;
  const normalDakScale = 1;
  const destroyedDakScale = 2;
  const dakTailLength = 100;
  const dakrandomGradientRange = 11;
  
  // Global variables.
  let dakNormalAnimation, dakDestroyedSpriteSheet, dakDestroyedAnimation, myDak, gameStartSound,
  gameOverSound, playerJoinedSound, otherDak, collisionSpriteGroup;
  
  // JSON for the dak destroyed animation sprite sheet frames.
  const dakDestroyedFrames = [
    { "name": "dakDestroyedFrame1", "frame": { "x": 0, "y": 0, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame2", "frame": { "x": 10, "y": 0, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame3", "frame": { "x": 20, "y": 0, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame4", "frame": { "x": 0, "y": 10, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame5", "frame": { "x": 10, "y": 10, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame6", "frame": { "x": 20, "y": 10, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame7", "frame": { "x": 0, "y": 20, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame8", "frame": { "x": 10, "y": 20, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame9", "frame": { "x": 20, "y": 20, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame10", "frame": { "x": 0, "y": 30, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame11", "frame": { "x": 10, "y": 30, "width": 10, "height": 10 } },
    { "name": "dakDestroyedFrame12", "frame": { "x": 20, "y": 30, "width": 10, "height": 10 } }
  ];
  
  // Utility functions.
  
  // Returns a random x coordinate inside the stage with a 10px margin.
  function randomXOrigin() {
    return game.floor(game.random(10, game.width - 9));
  }
  
  // Returns a random y coordinate inside the stage with a 10px margin.
  function randomYOrigin() {
    return game.floor(game.random(10, game.height - 9));
  }
  
  // Returns top, right, down, or left in degrees.
  function randomAngle() {
    const randomInteger = game.floor(game.random(4));
    switch(randomInteger) {
      case 0:
        return 0;
      case 1:
        return -90;
      case 2:
        return 180;
      case 3:
        return 90;
    }
  }
  
  // Calculates desired direction based on key input and current direction.
  function calculateNewDirection(keyPressedIs, theCurrentDirection) {
    if (keyPressedIs === "left") {
      switch(theCurrentDirection) {
        case -90:
          return 180;
        case 0:
          return -90;
        case 90:
          return 0;
        case 180:
          return 90;
      }
    } else {
      switch(theCurrentDirection) {
        case -90:
          return 0;
        case 0:
          return 90;
        case 90:
          return 180;
        case 180:
          return -90;
      }
    }
  }
  
  // Dak factory function.
  function createDak(x, y, angle) {
    const dak = {};
    const randomR = game.floor(game.random(256));
    const randomG = game.floor(game.random(256));
    const randomB = game.floor(game.random(256));
    let randomColor;
    const randomGradientIntensity = game.floor(game.random(dakrandomGradientRange));
    dak.color = game.color(randomR, randomG, randomB);
    dak.name = 'First Dak';
    dak.points = 0;
    dak.head = game.createSprite(x, y, dakWidth, dakHeight);
    dak.head.addAnimation('normal', dakNormalAnimation);
    dak.head.addAnimation('destroyed', dakDestroyedAnimation);
    dak.head.rotateToDirection = true;
    dak.head.setSpeed(normalSpeed, angle);
    dak.tail = [];
    for (let i = 0; i < dakTailLength; i++) {
      dak.tail.push(game.createSprite(x, y, dakWidth, dakHeight));
      randomColor = game.color(randomR + i * randomGradientIntensity, randomG + i * randomGradientIntensity, randomB + i * randomGradientIntensity);
      dak.tail[i].shapeColor = randomColor;
      collisionSpriteGroup.add(dak.tail[i]);
    }
    dak.moveTail = function(dak) {
      dak.tail[0].position = dak.head.previousPosition;
      dak.tail[0].setCollider('rectangle', 0, 0, dakWidth, dakHeight);
      for (let i = 1; i < dakTailLength; i++) {
        dak.tail[i].position = dak.tail[i - 1].previousPosition;
        dak.tail[i].setCollider('rectangle', 0, 0, dakWidth, dakHeight);
      }
    }
    dak.drawName = function(dak) {
      if (dak.head.getDirection() === 90) {
        game.text(myDak.name, myDak.head.position.x, myDak.head.position.y + dakHeight * 1.5);
      } else {
        game.text(myDak.name, myDak.head.position.x, myDak.head.position.y - dakHeight);
      }
    }
    return dak;
  }
  
  function printCollision() {
    console.log('COLLISION' + game.frameCount);
    return null;
  }
  
  // Game starts
  game.preload = function onPreload() {
    // Load sounds
    game.soundFormats('ogg', 'mp3');
    gameStartSound = game.loadSound('/sounds/sound-game-start.mp3');
    gameOverSound = game.loadSound('/sounds/sound-game-over.mp3');
    playerJoinedSound = game.loadSound('/sounds/sound-player-joined.mp3');
    
    // Load sprite, sprite sheet and animations.
    dakNormalAnimation = game.loadAnimation(new game.SpriteSheet('/sprites/sprite-dak.png',
    [{ "name": "dakNormal", "frame" :{ "x": 0, "y": 0, "width": dakWidth, "height": dakHeight } }]));
    dakDestroyedSpriteSheet = game.loadSpriteSheet('/sprites/sprite-sheet-dak-destroyed.png', dakDestroyedFrames);
    dakDestroyedAnimation = game.loadAnimation(dakDestroyedSpriteSheet);
  }
  
  game.setup = function onSetup() {
    game.createCanvas(game.windowWidth, game.windowHeight);
    game.frameRate(60);
    game.camera.zoom = game.windowWidth / 1000;
    
    // Sprite groups
    collisionSpriteGroup = new game.Group();
    
    // Spawn
    myDak = createDak(randomXOrigin(), randomYOrigin(), randomAngle());
    myDak.head.depth = 100;
    for (let i = 0; i < 4; i++) {
      collisionSpriteGroup.remove(myDak.tail[i]);
    }
    otherDak = createDak(20, 20, 0);
    gameStartSound.play();
    
    // myDak.head.debug = true;
    // for (let i = 0; i < dakTailLength; i++) {
    //   myDak.tail[i].debug = true;
    //   myDak.tail[i].setCollider('rectangle', 0, 0, dakWidth, dakHeight);
    // }
  };
  
  game.draw = function onDraw() {
    game.background(10, 10, 10);
    game.strokeWeight(5);
    game.noFill();
    game.stroke(255);
    game.rect(-8, -8, mapWidth + 16, mapHeight + 16);
    game.textAlign(game.CENTER);
    game.textSize(8);
    game.noStroke();
    game.fill('rgba(255, 255, 255, 0.25)');
    
    // Center camera.
    game.camera.position.x = myDak.head.position.x;
    game.camera.position.y = myDak.head.position.y;
    
    if(myDak.head.position.x < 0)
      myDak.head.position.x = 0;
    if(myDak.head.position.y < 0)
      myDak.head.position.y = 0;
    if(myDak.head.position.x > mapWidth)
      myDak.head.position.x = mapWidth;
    if(myDak.head.position.y > mapHeight)
      myDak.head.position.y = mapHeight;
    
    const myCurrentDirection = myDak.head.getDirection();
    const myCurrentSpeed = myDak.head.getSpeed();
    
    // Turn left.
    if (game.keyWentDown('left') || game.keyWentDown('A')) {
      myDak.head.setSpeed(myCurrentSpeed, calculateNewDirection('left', myCurrentDirection));
    }
    
    // Turn right.
    if (game.keyWentDown('right') || game.keyWentDown('D')) {
      myDak.head.setSpeed(myCurrentSpeed, calculateNewDirection('right', myCurrentDirection));
    }
    
    // Boost started.
    if (game.keyWentDown('space')) {
      myDak.head.setSpeed(boostedSpeed);
    }
    
    // Boost stopped.
    if (game.keyWentUp('space')) {
      myDak.head.setSpeed(normalSpeed);
    }
    
    // Brake started.
    if (game.keyWentDown('shift')) {
      myDak.head.setSpeed(brakeSpeed);
    }
    
    // Brake stopped.
    if (game.keyWentUp('shift')) {
      myDak.head.setSpeed(normalSpeed);
    }
    
    // Handle tail movement.
    myDak.moveTail(myDak);
    myDak.drawName(myDak);
    otherDak.moveTail(otherDak);
    
    if (game.frameCount > 10) {
      if (myDak.head.collide(collisionSpriteGroup)) {
        printCollision();
        myDak.head.immovable = true;
        myDak.head.limitSpeed(0);
        myDak.head.changeAnimation('destroyed');
        myDak.head.scale = destroyedDakScale;
      }
    }
    
    if (myDak.head.getAnimationLabel() === 'destroyed' && myDak.head.animation.getFrame() === 0) {
     gameOverSound.play();
    }
    
    if (myDak.head.getAnimationLabel() === 'destroyed' && myDak.head.animation.getFrame() === myDak.head.animation.getLastFrame()) {
      game.remove();
    }
    
    game.drawSprites();
  };
  
  game.windowResized = function onWindowResize() {
    game.resizeCanvas(game.windowWidth, game.windowHeight);
    game.camera.zoom = game.windowWidth / viewWidth;
  }
};

const renderedGame = new p5(gameToRender, 'js-game-element');
