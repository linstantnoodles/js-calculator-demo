(function() {

  // Cache window object
  var root = this;

  /**
   * Arithmetic calculator using Dijkstras infamous stack algorithms
   */

  // Token object
  var Token = function(value) {
    this.value = value;
  };

  Token.prototype = {

    constructor: Token,

    isNumber: function() {
      return isFinite(this.value);
    },

    isOperator: function() {
      return (this.value == "+"
          || this.value == "*"
          || this.value == "-"
          || this.value == "/"
          || this.value == "^");
    },

    isLeftParen: function() {
      return (this.value == "(");
    },

    isRightParen: function() {
      return (this.value == ")");
    },

    isLeftAssoc: function() {
      return (this.value == "^") ? false : true;
    },

    pre: function() {
      switch (this.value) {
        case "+": return 2;
        case "-": return 2;
        case "*": return 3;
        case "/": return 3;
        case "^": return 4;
        default: return null;
      }
    }
  };

  // Simple tokenizer
  var tokenize = function(str) {
    // Assume expression properly delimited by spaces
    return str.split(" ").map(function(val) {
      return new Token(val);
    });
  };

  /**
   * Dijkstra shunting-yard algorithm
   * Converts an infix, arithmetic expression into postfix
   *
   * @param {Object} tokens a list of token objects
   */

  var toPostFix = function(tokens) {
    var values = [],
      operators = [];

    if (tokens == null) {
      return tokens;
    }

    while (tokens.length > 0) {
      var tok = tokens.shift();
      if (tok.isNumber()) {
        values.push(tok);
      } else if (tok.isOperator()) {
        while (operators.length > 0
          && operators.slice(-1)[0].isOperator()
          && (
            (tok.isLeftAssoc() && tok.pre() <= operators.slice(-1)[0].pre())
            || (tok.pre() < operators.slice(-1)[0].pre())
            )
        ) {
          values.push(operators.pop());
        }
        operators.push(tok);
      } else if (tok.isLeftParen()) {
        operators.push(tok);
      } else if (tok.isRightParen()) {
        while (operators.length > 0 && !operators.slice(-1)[0].isLeftParen()) {
          values.push(operators.pop());
        }
        if (!operators.length || !operators.slice(-1)[0].isLeftParen()) {
          return;
        }
        // Pop left paren
        operators.pop();
      }
    }

    while (operators.length > 0) {
      values.push(operators.pop());
    }

    return values;
  }

  /**
   * Dijkstras two-stack algorithm variant
   * Evaluates a postfix expression
   *
   * @param {Object} tokens a list of token objects
   * @return {Object} a token object
   */

  var evaluate = function(tokens) {
    var values = [];

    if (tokens == null) {
      return tokens;
    }

    while (tokens.length > 0) {
      var token = tokens.shift();
      if (token.isNumber()) {
        values.push(token);
      } else if (token.isOperator()) {
        var opRight = parseInt(values.pop().value, 10),
          opLeft = parseInt(values.pop().value, 10),
          result;
        switch (token.value) {
          case "+":
            result = opLeft + opRight;
          break;
          case "-":
            result = opLeft - opRight;
          break;
          case "*":
            result = opLeft * opRight;
          break;
          case "/":
            result = opLeft / opRight;
          break;
          case "^":
            result = Math.pow(opLeft, opRight);
          break;
        }
        values.push(new Token(result));
      }
    }
    return values.pop();
  };

  var Expression = function() {
    this.tokens = [];
  };

  Expression.prototype = {

    constructor: Expression,

    addValue: function(value) {
      var newTok = new Token(value + "");
      if (newTok.isNumber() && this.tokens.length) {
        var prevTok = this.tokens.slice(-1)[0];
        if (prevTok.isNumber()) {
          prevTok.value += newTok.value;
          return;
        }
      }
      this.tokens.push(newTok);
    },

    evaluate: function() {
      this.tokens.push(evaluate(toPostFix(this.tokens)));
      return this.tokens[0].value;
    },

    toString: function() {
      return this.tokens.map(function(tok) {
        return tok.value;
      }).join(" ");
    },

    reset: function() {
      this.tokens = [];
    }
  };

  // Export
  root.Calculator = {
    newExpression: function() {
      return new Expression();
    },
    tokenize: tokenize
  };
})();
