/* Copyright (C) 2014 Mario Ampov, Stojan Dimitrovski, Andrej Kolarovski. All rights reserved. */

RoboL.CodeGenerator = function CodeGenerator () {

  var code = [];

  function pass(astNode) {

    switch (astNode.type) {

    case 'IDENTIFIER':

      return astNode.value;

    case 'VALUE:NUMBER':

      return astNode.value;

    case 'VALUE:DIRECTION':

      return astNode.value;

    case 'POSITION:ACCESS':

      return pass(astNode.identifier) + '.' + astNode.value;

    case 'PROGRAM':

      for (var i = 0; i < astNode.procedures.length; i++) {
        pass(astNode.procedures[i]);
      }

      break;

    case 'PROCEDURE:DEFINITION':

      code.push(pass(astNode.name) + ':');

      for (var i = 0; i < astNode.arguments.length; i++) {
        pass(astNode.arguments[i]);
      }

      for (var i = 0; i < astNode.body.length; i++) {
        pass(astNode.body[i]);
      }

      code.push('ret');

      break;

    case 'ARGUMENT:DEFINITON':

      code.push('data ' + pass(astNode.name));

      break;

    case 'VARIABLE':

      for (var i = 0; i < astNode.variables.length; i++) {
        code.push('data ' + pass(astNode.variables[i]));
      }

      break;

    case 'COMMAND':

      if (astNode.command == 'моменталнапозиција') {
        return astNode.command;
      } else {
        switch (astNode.command) {
        case 'оди':
          code.push('go');
          break;
        case 'свртилево':
          code.push('rl');
          break;
        case 'свртидесно':
          code.push('rr');
          break;
        case 'земи':
          code.push('tk');
          break;
        case 'остави':
          code.push('lv');
          break;
        }
      }

      break;

    case 'FUNCTION:CALL':

      var args = '';
      for (var i = 0; i < astNode.arguments.length; i++) {
        args += pass(astNode.arguments[i].value);
        if (i < astNode.arguments.length - 1) {
          args += ',';
        }
      }

      code.push('call ' + pass(astNode.name) + '(' + args + ')');

      break;

    case 'ASSIGNMENT':

      if (astNode.value.type == 'MATH:EXPRESSION') {
        code.push('push');
        pass(astNode.value);
        code.push('move ' + pass(astNode.varAssigned) + ' regn');
        code.push('pop');
      } else {
        code.push('move ' + pass(astNode.varAssigned) + ' ' + pass(astNode.value));
      }

      break;

    case 'MATH:EXPRESSION':

      if (astNode.leftOperand.type == 'MATH:EXPRESSION') {
        pass(astNode.leftOperand);
      } else {
        code.push('move regn ' + pass(astNode.leftOperand));
      }

      switch (astNode.operator) {
      case '*':

        code.push('mul regn ' + pass(astNode.rightOperand));
        break;

      case '-':

        code.push('sub regn ' + pass(astNode.rightOperand));
        break;

      case '+':

        code.push('add regn ' + pass(astNode.rightOperand));
        break;

      }

      break;

    case 'CONDITION':

      switch (astNode.condition.type) {

      case 'CONDITION:ZHETON':

        code.push('cmp regc $c');
        code.push('jne next');

        break;

      case 'CONDITION:WALL':

        code.push('cmp regc $w');
        code.push('jne next');

        break;

      case 'CONDITION:EXPRESSION':

        code.push('push');

        if (astNode.condition.rightOperand.type == 'MATH:EXPRESSION') {
          pass(astNode.condition.rightOperand);
          code.push('move _temp regn');
        } else {
          code.push('move _temp ' + pass(astNode.condition.rightOperand));
        }

        if (astNode.condition.leftOperand.type == 'MATH:EXPRESSION') {
          pass(astNode.condition.leftOperand);
        } else {
          code.push('move regn ' + pass(astNode.condition.leftOperand));
        }

        code.push('cmp regn _temp');

        code.push('pop');

        switch (astNode.condition.comparison) {

        case '>':

          code.push('jm next');

          break;

        case '>=':

          code.push('jme next');

          break;

        case '<':

          code.push('jl next');

          break;

        case '<=':

          code.push('jle next');

          break;

        case '==':

          code.push('jie next');

          break;

        case '!=':

          code.push('jne next');

          break;

        }

        break;

      default:

        code.push('cmp regd ' + pass(astNode.condition));
        code.push('jne next');

        break;

      }

      for (var i = 0; i < astNode.body.length; i++) {

        pass(astNode.body[i]);

      }

      code.push('next:');

      break;


    case 'LOOP:UNTIL':

      code.push('start:');

      for (var i = 0; i < astNode.body.length; i++) {

        pass(astNode.body[i]);

      }

      switch (astNode.condition.type) {

      case 'CONDITION:ZHETON':

        code.push('cmp regc $c');
        code.push('jne');

        break;

      case 'CONDITION:WALL':

        code.push('cmp regc $w');
        code.push('jne');

        break;

      case 'CONDITION:EXPRESSION':

        code.push('push');

        if (astNode.condition.rightOperand.type == 'MATH:EXPRESSION') {
          pass(astNode.condition.rightOperand);
          code.push('move _temp regn');
        } else {
          code.push('move _temp ' + pass(astNode.condition.rightOperand));
        }

        if (astNode.condition.leftOperand.type == 'MATH:EXPRESSION') {
          pass(astNode.condition.leftOperand);
        } else {
          code.push('move regn ' + pass(astNode.condition.leftOperand));
        }

        code.push('cmp regn _temp');

        code.push('pop');

        switch (astNode.condition.comparison) {

        case '>':

          code.push('jle');

          break;

        case '>=':

          code.push('jl');

          break;

        case '<':

          code.push('jme');

          break;

        case '<=':

          code.push('jm');

          break;

        case '==':

          code.push('jne');

          break;

        case '!=':

          code.push('jie');

          break;

        };

        break;

      default:

        code.push('cmp regd ' + pass(astNode.condition));
        code.push('jne');

        break;

      };

      break;

    case 'LOOP:TIMES':

      code.push('move regn 0');
      code.push('start:');
      code.push('inc');

      for (var i = 0; i < astNode.body.length; i++) {

        pass(astNode.body[i]);

      };

      code.push('cmp regn ' + pass(astNode.value));
      code.push('jl');

      break;

    };

  };

  this.generateCode = function generateCode(ast) {

    code = [];
    pass(ast);
    return code;

  };

};
