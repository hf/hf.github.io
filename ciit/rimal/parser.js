// Copyright (C) 2014 Mario Ampov, Stojan Dimitrovski, Andrej Kolarovski. All rights reserved.

var PARSER = new function () {

  function parseRimal(text) {

    var lines = text;
    lines = lines.toLowerCase();
    lines = lines.split(/\n/g);

    for (var i = 0; i < lines.length; i++) {
      lines[i] = lines[i].trim();
    }

    INTERPRETER.setCode(lines);
    INTERPRETER.run();

    return lines.join('\n');
  }

  function parseEnv(text) {


    var lines = text;
    lines = lines.toLowerCase();
    lines = lines.replace(/\r\n+|\r+|\n+/g, '\n');
    lines = lines.replace(/^\n|\n$/g, '');
    lines = lines.split(/\n/g);

    var reg;

    reg = /околина \(\d+,\d+\)/i;
    if (!reg.test(lines[0].trim())) {
      throw new Error("Грешка во околината! Линија 1");
      return;
    }
    var hv = lines[0].trim().split(" ")[1].split(',');
    var linesH = parseInt(hv[0].substr(1, hv[0].length));
    var linesV = parseInt(hv[1]);



    if (lines[1].trim() !== "ѕидови") {
      throw new Error("Грешка во околината! Линија 2");
      return;
    }
    if (lines[2].trim() !== "почеток") {
      throw new Error("Грешка во околината! Линија 3");
      return;
    }
    var i = 3;
    reg = /.. \d+ \d+-\d+/i;
    var walls = [];
    while (lines[i].trim() !== "крај") {

      if (!reg.test(lines[i].trim())) {
        throw new Error("Грешка во околината! Линија " + (i + 1));
        return;
      }

      var w = lines[i].trim().split(" ");
      var ww = w[2].split("-");
      walls.push([ w[0], parseInt(w[1]), parseInt(ww[0]), parseInt(ww[1]) ]);

      i++;
      if (i >= lines.length) {
        throw new Error("Грешка во околината! Линија " + (i + 1));
        return;
      }
    }



    i++;
    if (lines[i].trim() !== "ознаки") {
      throw new Error("Грешка во околината! Линија " + (i+1));
      return;
    }
    i++;
    if (lines[i].trim() !== "почеток") {
      throw new Error("Грешка во околината! Линија " + (i+1));
      return;
    }
    i++;
    reg = /\(\d+,\d+\)/i;
    var coins = []
    while (lines[i].trim() !== "крај") {

      if (!reg.test(lines[i].trim())) {
        throw new Error("Грешка во околината! Линија " + (i + 1));
        return;
      }

      var w = lines[i].trim().split(",");
      coins.push([parseInt(w[0].substr(1, w[0].length)) , parseInt(w[1].substr(0, w[1].length - 1))]);

      i++;
      if (i >= lines.length) {
        throw new Error("Грешка во околината! Линија " + (i + 1));
        return;
      }
    }



    i++;
    reg = /робот .\(\d+,\d+\)/i;
    if (!reg.test(lines[i].trim())) {
      throw new Error("Грешка во околината! Линија " + (i + 1));
      return;
    }
    var r = lines[i].trim().split(" ");
    var rr = r[1].split("(");
    var rrr = rr[1].split(",");



    DATA.linesH = linesH;
    DATA.linesV = linesV;
    DATA.walls = walls;
    DATA.coins = coins;
    DATA.robot = [DATA.getDirection(rr[0]) , parseInt(rrr[0]) , parseInt(rrr[1].substr(0, rrr[1].length - 1))];

    return lines.join('\n');

  }

  this.parseEnv = parseEnv;
  this.parseRimal = parseRimal;

}
