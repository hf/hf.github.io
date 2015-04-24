// Copyright (C) 2014 Mario Ampov, Stojan Dimitrovski, Andrej Kolarovski. All rights reserved.

var INTERPRETER = new function () {

  var code = [];
  var labelTable = {};
  var regN;
  var compare = false;
  var less, greater;
  var cp;
  var rp = [];
  var stack = [];
  var ram = {};
  var namespace = [];
  var argv = [];
  var carg = 0;

  var state = 0;

  var currentStep = 1;
  var time = 1.0;
  var movementType = 1;
  var rotationDirection = 1;

  function getValue(n) {
    if (!isNaN(parseInt(n))) {
      return parseInt(n);
    } else if (n == 'regn') {
      return regN;
    } else if (n == 'с' || n == 'и'|| n == 'ј'|| n == 'з'){
      return n;
    } else if (n == 'моменталнапозиција') {
      return [DATA.robot[1], DATA.robot[2]];
    } else {
      return ram[namespace.join('/') + '/' + n];
    }
  }

  function goToNext() {
    while (code[cp] != 'next:') {
      cp++;
    }
    cp++
  }

  function goToStart() {
    cp--;
    while (code[cp] != 'start:') {
      cp--;
    }
    cp++;
  }

  this.update = function () {
    var sleep = 0;

    // STOPED

    if (state === 0) {
      return sleep;
    }

    // MOVEMENT ANIMATION

    if (state === 3) {

      var steps = time / (1.0 / 24.0);

      if (movementType === 1) {
        var step = 1 / steps;
        DATA.robot[2] -= Math.sin(DATA.robot[0]) * step;
        DATA.robot[1] -= Math.cos(DATA.robot[0]) * step;
      } else if (movementType === 2) {
        var step = (Math.PI / 2) / steps;
        DATA.robot[0] += rotationDirection * step;
      }

      if (currentStep === steps) {
        DATA.robot[2] = Math.round(DATA.robot[2]);
        DATA.robot[1] = Math.round(DATA.robot[1]);
        state = 1;
      } else {
        currentStep++;
      }

      return (time / steps) * 1000;
    }

    // RUNNING CODE

    var reg;
    var instruction = code[cp];
    cp++;

    //Procedures and flow

    reg = /.*:/i;
    if (reg.test(instruction)) {
      reg = /start:/i;
      if (reg.test(instruction)) {
        return sleep;
      }
      reg = /next:/i;
      if (reg.test(instruction)) {
        return sleep;
      }
      namespace.push(instruction);
      return sleep;
    }

    reg = /ret/i;
    if (reg.test(instruction)) {
      if (rp.length === 0) {
        state = 0;
      } else {
        cp = rp.pop();
        namespace.pop();
      }
      return sleep;
    }

    reg = /data .*/i;
    if (reg.test(instruction)) {
      var tmp = 0;
      if (carg < argv.length) {
        tmp = argv[carg]
        carg++;
      }
      ram[namespace.join('/') + '/' + instruction.split(' ')[1]] = tmp;
      return sleep;
    }

    reg = /call .*/i;
    if (reg.test(instruction)) {
      var tmp = instruction.split(' ')[1].split('(');
      rp.push(cp);
      cp = labelTable[tmp[0] + ':'];
      tmp = tmp[1].slice(0, -1).split(',');
      carg = 0;
      argv = [];
      for (var i in tmp) {
        argv.push(getValue(tmp[i]));
      }
      return sleep;
    }

    reg = /jie next/i;
    if (reg.test(instruction)) {
      if (compare) {
        goToNext();
      }
      return sleep;
    }

    reg = /jne next/i;
    if (reg.test(instruction)) {
      if (!compare) {
        goToNext();
      }
      return sleep;
    }

    reg = /jl next/i;
    if (reg.test(instruction)) {
      if (less) {
        goToNext();
      }
      return sleep;
    }

    reg = /jle next/i;
    if (reg.test(instruction)) {
      if (less || compare) {
        goToNext();
      }
      return sleep;
    }

    reg = /jm next/i;
    if (reg.test(instruction)) {
      if (greater) {
        goToNext();
      }
      return sleep;
    }

    reg = /jme next/i;
    if (reg.test(instruction)) {
      if (greater || compare) {
        goToNext();
      }
      return sleep;
    }

    reg = /jie/i;
    if (reg.test(instruction)) {
      if (compare) {
        goToStart();
      }
      return sleep;
    }

    reg = /jne/i;
    if (reg.test(instruction)) {
      if (!compare) {
        goToStart();
      }
      return sleep;
    }

    reg = /jl/i;
    if (reg.test(instruction)) {
      if (less) {
        goToStart();
      }
      return sleep;
    }

    reg = /jle/i;
    if (reg.test(instruction)) {
      if (less || compare) {
        goToStart();
      }
      return sleep;
    }

    reg = /jm/i;
    if (reg.test(instruction)) {
      if (greater) {
        goToStart();
      }
      return sleep;
    }

    reg = /jme/i;
    if (reg.test(instruction)) {
      if (greater || compare) {
        goToStart();
      }
      return sleep;
    }

    //Transfer

    reg = /move regN .*/i;
    if (reg.test(instruction)) {
      regN = getValue(instruction.split(' ')[2]);
      return sleep;
    }

    reg = /move .*/i;
    if (reg.test(instruction)) {
      var tmp = instruction.split(' ');
      var val = getValue(tmp[2]);
      if (val instanceof Array) {
        ram[namespace.join('/') + '/' + tmp[1] + '.x'] = val[0];
        ram[namespace.join('/') + '/' + tmp[1] + '.y'] = val[1];
      } else {
        ram[namespace.join('/') + '/' + tmp[1]] = val;
      }
      return sleep;
    }

    reg = /push/i;
    if (reg.test(instruction)) {
      stack.push(regN);
      return sleep;
    }

    reg = /pop/i;
    if (reg.test(instruction)) {
      regN = stack.pop();
      return sleep;
    }

    //COMPARE

    reg = /cmp regN .*/i;
    if (reg.test(instruction)) {
      compare = regN === getValue(instruction.split(' ')[2]);
      less = regN < getValue(instruction.split(' ')[2]);
      greater = regN > getValue(instruction.split(' ')[2]);
      return sleep;
    }

    reg = /cmp regD .*/i;
    if (reg.test(instruction)) {
      compare = DATA.robot[0] === DATA.getDirection(getValue(instruction.split(' ')[2]));
      return sleep;
    }

    reg = /cmp regC \$W/i;
    if (reg.test(instruction)) {
      compare = false;
      for (i in DATA.walls) {
        if (DATA.robot[0] === 0) {
          if (DATA.robot[1] === 1) {
            compare = true;
          }
          if (DATA.walls[i][0] === 'сј' && DATA.walls[i][1] === DATA.robot[1] - 1
            && DATA.walls[i][2] <= DATA.robot[2] && DATA.walls[i][3] >= DATA.robot[2]) {
              compare = true;
          }
        }
        if (DATA.robot[0] === Math.PI) {
          if (DATA.robot[1] === DATA.linesH) {
            compare = true;
          }
          if (DATA.walls[i][0] === 'сј' && DATA.walls[i][1] === DATA.robot[1] + 1
            && DATA.walls[i][2] <= DATA.robot[2] && DATA.walls[i][3] >= DATA.robot[2]) {
              compare = true;
          }
        }
        if (DATA.robot[0] === -Math.PI / 2) {
          if (DATA.robot[2] === DATA.linesV) {
            compare = true;
          }
          if (DATA.walls[i][0] === 'из' && DATA.walls[i][1] === DATA.robot[2] + 1
            && DATA.walls[i][2] <= DATA.robot[1] && DATA.walls[i][3] >= DATA.robot[1]) {
              compare = true;
          }
        }
        if (DATA.robot[0] === Math.PI / 2) {
          if (DATA.robot[2] === 1) {
            compare = true;
          }
          if (DATA.walls[i][0] === 'из' && DATA.walls[i][1] === DATA.robot[2] - 1
            && DATA.walls[i][2] <= DATA.robot[1] && DATA.walls[i][3] >= DATA.robot[1]) {
              compare = true;
          }
        }
      }
      return sleep;
    }

    reg = /cmp regC \$C/i;
    if (reg.test(instruction)) {
      compare = false;
      for (i in DATA.coins) {
        if (DATA.coins[i][0] === DATA.robot[1] && DATA.coins[i][1] === DATA.robot[2]) {
          compare = true;
          break;
        }
      }
      return sleep;
    }

    //Arithmetic

    reg = /add regN .*/i;
    if (reg.test(instruction)) {
      regN += getValue(instruction.split(' ')[2]);
      return sleep;
    }

    reg = /sub regN .*/i;
    if (reg.test(instruction)) {
      regN -= getValue(instruction.split(' ')[2]);
      return sleep;
    }

    reg = /mul regN .*/i;
    if (reg.test(instruction)) {
      regN *= getValue(instruction.split(' ')[2]);
      return sleep;
    }

    reg = /inc/i;
    if (reg.test(instruction)) {
      regN++;
      return sleep;
    }

    //ROBOT

    reg = /rl/i;
    if (reg.test(instruction)) {
      movementType = 2;
      rotationDirection = -1;
      time = 0.5;
      state = 3;
      currentStep = 1;
      return sleep;
    }

    reg = /rr/i;
    if (reg.test(instruction)) {
      movementType = 2;
      rotationDirection = 1;
      time = 0.5;
      state = 3;
      currentStep = 1;
      return sleep;
    }

    reg = /go/i;
    if (reg.test(instruction)) {
      movementType = 1;
      time = 1.0;
      state = 3;
      currentStep = 1;
      return sleep;
    }

    reg = /tk/i;
    if (reg.test(instruction)) {
      for (i in DATA.coins) {
        if (DATA.coins[i][0] === DATA.robot[1] && DATA.coins[i][1] === DATA.robot[2]) {
          DATA.coins.splice(i, 1);
        }
      }
      return sleep;
    }

    reg = /lv/i;
    if (reg.test(instruction)) {
      var coinExist = false;
      for (i in DATA.coins) {
        if (DATA.coins[i][0] === DATA.robot[1] && DATA.coins[i][1] === DATA.robot[2]) {
          coinExist = true;
        }
      }
      if (!coinExist) {
        DATA.coins.push([DATA.robot[1], DATA.robot[2]]);
      }
      return sleep;
    }

    alert('Грешка на линија: ' + (cp - 1));
    state = 0;
    return sleep;

  }

  this.reset = function () {

    compare = false;
    stack = [];
    ram = {};
    argv = [];
    namespace = [];
    carg = 0;
    cp = labelTable['main:'];

  }

  this.run = function () {

    state = 1;

  }

  this.stop = function () {

    state = 0;

  }

  this.setCode = function (lines) {

    var reg = /.*:/i;
    code = [];
    labelTable = {};

    for (var i = 0; i < lines.length; i++) {
      code.push(lines[i]);
      if (reg.test(lines[i])) {
        labelTable[lines[i]] = i;
      }
    }

    this.reset();

  }

}
