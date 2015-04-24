/* Copyright (C) 2014 Mario Ampov, Stojan Dimitrovski, Andrej Kolarovski. All rights reserved. */

(function(RoboL, LLexer) {
  RoboL.LINE_SEPARATOR = "\n";

  RoboL.Lexer = function Lexer() {
    this._lexer = new LLexer();

    var yylineno = 0;

    var updateLineNumber = function updateLineNumber(lineno) {
      yylineno += lineno;
    };

    // end of file
    this._lexer.addRule(/$/, function(lexeme) {
      return "EOF";
    });

    this._lexer.addRule(/\:[\n\r \t]*![\n\r \t]*/, function(lexeme) {
      updateLineNumber(lexeme.split(RoboL.LINE_SEPARATOR).length - 1);

      return "LOOP:BLOCK";
    });

    this._lexer.addRule(/[\n\r \t]*![\n\r \t]*/, function(lexeme) {
      updateLineNumber(lexeme.split(RoboL.LINE_SEPARATOR).length - 1);

      return "BLOCK";
    });

    // end of statement
    this._lexer.addRule(/[\n\r]+/, function(lexeme) {
      updateLineNumber(lexeme.split(RoboL.LINE_SEPARATOR).length - 1);
      // return "EOS";
    });

    // white space doesn't matter
    this._lexer.addRule(/[ \t]+/, function(lexeme) {
      // return "WS";
    });

    this._lexer.addRule(/(==|>=|<=|<>|>|<)/, function(lexeme) {
      this.yytext = lexeme;

      return "OPERATOR:BINARY:COMPARISON";
    });

    this._lexer.addRule(/=/, function(lexeme) {
      this.yytext = lexeme;

      return "OPERATOR:BINARY:ASSIGNMENT";
    })

    this._lexer.addRule(/[\+\-\*]/, function(lexeme) {
      this.yytext = lexeme;

      return "OPERATOR:BINARY:MATH";
    });

    this._lexer.addRule(/\/[ \t]*x/i, function(lexeme) {
      return "OPERATOR:UNARY:ACCESS-X";
    });

    this._lexer.addRule(/\/[ \t]*y/i, function(lexeme) {
      return "OPERATOR:UNARY:ACCESS-Y";
    });

    // list separator, example: (1, 2, 3) / (a, b, c)
    this._lexer.addRule(/,/, function(lexeme) {
      return "LIST-SEPARATOR";
    });

    this._lexer.addRule(/\(/, function(lexeme) {
      return "PAREN:OPEN";
    });

    this._lexer.addRule(/\)/, function(lexeme) {
      return "PAREN:CLOSE";
    });

    this._lexer.addRule(/процедура/i, function(lexeme) {
      return "PROCEDURE:DEFINITION";
    });

    this._lexer.addRule(/почеток/i, function(lexeme) {
      return "PROCEDURE:INSTRUCTIONS-START";
    });

    this._lexer.addRule(/крај/i, function(lexeme) {
      return "PROCEDURE:INSTRUCTIONS-END";
    });

    this._lexer.addRule(/променлива/i, function(lexeme) {
      return "VARIABLE:DECLARATION";
    });

    this._lexer.addRule(/број/i, function(lexeme) {
      return "TYPE:NUMBER";
    });

    this._lexer.addRule(/насока/i, function(lexeme) {
      return "TYPE:DIRECTION";
    });

    this._lexer.addRule(/позиција/i, function(lexeme) {
      return "TYPE:POSITION";
    });

    this._lexer.addRule(/оди|свртилево|свртидесно|земи|остави|моменталнапозиција/i, function(lexeme) {
      this.yytext = lexeme;

      return "COMMAND";
    });

    this._lexer.addRule(/повторувај/i, function(lexeme) {
      return "LOOP";
    });

    this._lexer.addRule(/до/i, function(lexeme) {
      return "LOOP:UNTIL";
    });

    this._lexer.addRule(/пати/i, function(lexeme) {
      return "LOOP:TIMES";
    });

    this._lexer.addRule(/ако/i, function(lexeme) {
      return "CONDITIONAL";
    });

    this._lexer.addRule(/жетон/i, function(lexeme) {
      this.yytext = lexeme;

      return "CONDITION:ZHETON";
    });

    this._lexer.addRule(/ѕид/i, function(lexeme) {
      this.yytext = lexeme;

      return "CONDITION:WALL";
    });

    this._lexer.addRule(/и|с|з|ј/i, function(lexeme) {
      this.yytext = lexeme;

      return "VALUE:DIRECTION";
    });

    this._lexer.addRule(/0|[1-9]+[0-9]*/, function(lexeme) {
      this.yytext = lexeme;

      return "VALUE:NUMBER";
    });

    this._lexer.addRule(/[a-zабвгдѓежзѕијклљмнњопрстќуфхцчџш_.]+[0-9a-zабвгдѓежзѕијклљмнњопрстќуфхцчџш_.]*/i, function(lexeme) {
      this.yytext = lexeme;

      return "IDENTIFIER";
    });

    Object.defineProperty(this, "yytext", {
      get: function() {
        return this._lexer.yytext;
      }
    });

    Object.defineProperty(this, "yylineno", {
      get: function() {
        return yylineno;
      }
    });

    Object.defineProperty(this, "reject", {
      get: function() {
        return this._lexer.reject;
      }
    });

    Object.defineProperty(this, "index", {
      get: function() {
        return this._lexer.index;
      }
    });

    Object.defineProperty(this, "state", {
      get: function() {
        return this._lexer.state;
      }
    });

    Object.defineProperty(this, "input", {
      get: function() {
        return this._lexer.input;
      }
    });
  };

  RoboL.Lexer.TOKENS = {};
  RoboL.Lexer.RESERVED = "почеток крај процедура променлива жетон ѕид променлива ако повторувај до пати моменталнапозиција број насока позиција и с з ј оди свртилево свртидесно земи остави".split(/\s+/);

  RoboL.Lexer.prototype.lex = function lex(translate) {
    var token = this._lexer.lex();

    if (!!translate && !!token && typeof RoboL.Lexer.TOKENS[token] !== 'undefined') {
      return RoboL.Lexer.TOKENS[token];
    }

    return token;
  };

  RoboL.Lexer.prototype.setInput = function setInput(input) {
    this._lexer.setInput(input);

    return this;
  };

  RoboL.Lexer.prototype.lexAll = function lexAll(input, translate) {
    var tokens = []
      , token  = null;

    this.setInput(input);

    while (!!(token = this.lex(translate))) {
      tokens.push(token);
    };

    return tokens;
  };

  return RoboL.Lexer;
})(RoboL, Lexer);
