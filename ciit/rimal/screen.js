// Copyright (C) 2014 Mario Ampov, Stojan Dimitrovski, Andrej Kolarovski. All rights reserved.

$(function() {
  window.SCREEN = new function () {

  // Draw parameters.
  var width = 200;
  var height = 200;
  var thickLine = 12;
  var thinLine = 10;
  var borderColor = 0x081724;
  var networkColor = 0x589494;
  var wallColor = 0x081724;
  var bgColor = 0xFFFFFF;
  var coinColor = 0xFFFF0B;
  var coinSize = 20;

  // Screen setup.
  var stage = new PIXI.Stage(bgColor);
  var renderer = new PIXI.CanvasRenderer(width, height);
  var view = renderer.view;
  view.style.marginLeft = 'auto';
  view.style.marginRight = 'auto';
  view.style.display = 'block';
  document.getElementById('simulation').appendChild(view);

  function resize() {
    stage.width = stage.height = width = height = $("#simulation").width();

    renderer.resize(width, width);
    renderer.render(stage);
  }

  $(window).resize(resize);

  // Add layers.
  var border = new PIXI.Graphics();
  stage.addChild(border);

  var network = new PIXI.Graphics();
  stage.addChild(network);

  var walls = new PIXI.Graphics();
  stage.addChild(walls);

  var coins = new PIXI.Graphics();
  stage.addChild(coins);

  var robot = PIXI.Sprite.fromImage("./rimal/robot.png", true);

  robot.anchor.x = 0.5;
  robot.anchor.y = 0.5;
  stage.addChild(robot);

  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }

  function update() {
    var sleepTime = INTERPRETER.update();

    var linesH = DATA.linesH;
    var linesV = DATA.linesV;
    var wallsData = DATA.walls;
    var coinsData = DATA.coins;
    var robotData = DATA.robot;

    var widthStep = (width - (2 * thickLine)) / (linesV + 1);
    var heightStep = (height - (2 * thickLine)) / (linesH + 1);

    border.clear();
    border.lineStyle(thickLine, borderColor, 1);
    var offset = thickLine / 2.0;
    border.drawRect(0 + offset, 0 + offset, width - thickLine, height - thickLine);

    // Draw network.
    network.clear();
    network.lineStyle(thinLine, networkColor, 1);
    for (var i=1; i<=linesH; i++) {
      var y = thickLine + (i * heightStep);
      network.moveTo(thickLine, y);
      network.lineTo(width - thickLine, y);
    }
    for (var i=1; i<=linesV; i++) {
      var x = thickLine + (i * widthStep);
      network.moveTo(x, thickLine);
      network.lineTo(x, height - thickLine);
    }

    // Draw walls.
    walls.clear();
    walls.lineStyle(thinLine, wallColor, 1);
    for (var i=0; i<wallsData.length; i++) {
      if (wallsData[i][0] === 'сј') {
        var x = thickLine + (wallsData[i][1] * widthStep) + (widthStep / 2.0);
        var yBegin = thickLine + (wallsData[i][2] * heightStep) - (heightStep / 2.0);
        var yEnd = thickLine + (wallsData[i][3] * heightStep) + (heightStep / 2.0);
        walls.moveTo(x, yBegin);
        walls.lineTo(x, yEnd);
      } else {
        var y = thickLine + (wallsData[i][1] * heightStep) + (heightStep / 2.0);
        var xBegin = thickLine + (wallsData[i][2] * widthStep) - (widthStep / 2.0);
        var xEnd = thickLine + (wallsData[i][3] * widthStep) + (widthStep / 2.0);
        walls.moveTo(xBegin, y);
        walls.lineTo(xEnd, y);
      }
    }

    // Draw coins.
    coins.clear();
    coins.lineStyle(0);
    coins.beginFill(coinColor, 1);
    for (var i=0; i<coinsData.length; i++) {
      var x = thickLine + (coinsData[i][0] * widthStep)
      var y = thickLine + (coinsData[i][1] * heightStep)
      coins.drawCircle(x, y, coinSize);
    }
    coins.endFill();

    // Draw robot.
    robot.rotation = robotData[0];
    robot.position.x = thickLine + (robotData[1] * widthStep);
    robot.position.y = thickLine + (robotData[2] * heightStep);

    renderer.render(stage);

    setTimeout(function() {
      requestAnimFrame(update);
    }, sleepTime);
  }

  // Run the render loop.
  requestAnimFrame(update);

  this.resize = resize;
}
});
