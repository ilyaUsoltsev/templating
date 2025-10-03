import { IfStmt, MustacheStmt, PartialStmt, Stmt, StringStmt } from './ast';
import { Token } from './token';
import { KEYWORDS, TOKEN_TYPE } from './token-types';

class Parser {
  tokens: Token[];
  current: number = 0;
  statements: Stmt[] = [];

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(tokens: Token[]): Stmt[] {
    this.tokens = tokens;
    while (!this.isAtEnd()) {
      const stmt = this.getStatement();
      if (stmt) {
        this.statements.push(stmt);
      }
    }
    return this.statements;
  }

  private consume(type: Token['type'], message: string) {
    if (this.check(type)) {
      return this.advance();
    }

    throw new Error(message);
  }

  private getStatement(currentBlock?: 'tag' | 'partial'): Stmt {
    if (this.match(TOKEN_TYPE.MUSTASHES_OPEN, TOKEN_TYPE.HASH, KEYWORDS.if)) {
      return this.ifStatement();
    }

    if (this.match(TOKEN_TYPE.MUSTASHES_OPEN, TOKEN_TYPE.GREATER)) {
      return this.partialStatement();
    }

    if (
      (currentBlock === 'tag' || currentBlock === 'partial') &&
      this.match(TOKEN_TYPE.IDENTIFIER, TOKEN_TYPE.EQUAL)
    ) {
      return this.attributeStatement();
    }

    if (this.match(TOKEN_TYPE.LESS)) {
      return this.tagStatement();
    }

    if (this.match(TOKEN_TYPE.STRING)) {
      return this.stringStatement();
    }

    if (this.match(TOKEN_TYPE.MUSTASHES_OPEN)) {
      return this.mustachesStatement();
    }

    this.advance();
    return this.identifierStatement();
  }

  private partialStatement(): PartialStmt {
    this.consume(TOKEN_TYPE.WHITESPACE, 'Expect WHITESPACE after {{> ');
    const partial = this.consume(
      TOKEN_TYPE.IDENTIFIER,
      'Expecting condition variable'
    );

    const attributeStmts = [];

    while (
      !this.check(TOKEN_TYPE.MUSTASHES_CLOSE) &&
      !this.check(TOKEN_TYPE.EOF)
    ) {
      const statement = this.getStatement('partial');
      if (statement) {
        attributeStmts.push(statement);
      }
    }

    this.consume(
      TOKEN_TYPE.MUSTASHES_CLOSE,
      'Expecting }} at the end of a partial expression'
    );

    return {
      type: 'PartialStmt',
      name: partial.lexeme,
      attributes: attributeStmts,
    };
  }

  private mustachesStatement(): MustacheStmt {
    console.log(this.peek());
    const variableToken = this.consume(
      TOKEN_TYPE.IDENTIFIER,
      "Expect variable name after '{{'."
    );

    this.consume(
      TOKEN_TYPE.MUSTASHES_CLOSE,
      "Expect '}}' after variable name."
    );
    return {
      type: 'MustacheStmt',
      variable: variableToken.lexeme,
    };
  }

  private tagStatement(): Stmt {
    const tagToken = this.consume(
      TOKEN_TYPE.IDENTIFIER,
      "Expect tag name after '<'."
    );

    const statements: Stmt[] = [];

    while (!this.check(TOKEN_TYPE.GREATER) && !this.check(TOKEN_TYPE.EOF)) {
      const statement = this.getStatement('tag');
      if (statement) {
        statements.push(statement);
      }
    }

    this.consume(TOKEN_TYPE.GREATER, "Expect '>' after tag name.");

    const children: Stmt[] = [];
    while (!this.check(TOKEN_TYPE.TAG_CLOSE) && !this.check(TOKEN_TYPE.EOF)) {
      const statement = this.getStatement();
      if (statement) {
        children.push(statement);
      }
    }

    this.consume(TOKEN_TYPE.TAG_CLOSE, "Expect '</' before closing tag name.");
    this.consume(
      TOKEN_TYPE.IDENTIFIER,
      'Expect tag name after </ in closing tag.'
    );
    this.consume(TOKEN_TYPE.GREATER, "Expect '>' after closing tag name.");

    return {
      type: 'HtmlTagStmt',
      tag: tagToken.lexeme,
      attributes: statements,
      children: children,
    };
  }

  private stringStatement(): StringStmt {
    const statements: Stmt[] = [];

    while (!this.check(TOKEN_TYPE.STRING) && !this.check(TOKEN_TYPE.EOF)) {
      const statement = this.getStatement();
      if (statement) {
        statements.push(statement);
      }
    }

    this.consume(
      TOKEN_TYPE.STRING,
      "Expect '\"' in the end of string statement."
    );

    return {
      type: 'StringStmt',
      children: statements,
    };
  }

  private identifierStatement(): Stmt {
    const identifier = this.previous();

    return {
      type: 'LiteralStmt',
      value: identifier.lexeme,
    };
  }

  private attributeStatement(): Stmt {
    this.goBack();
    this.goBack();
    // we are at IDENTIFIER
    const left = this.consume(
      TOKEN_TYPE.IDENTIFIER,
      'Expect identifier at attribute statement start.'
    );

    this.consume(TOKEN_TYPE.EQUAL, "Expect '=' after attribute name.");
    const isStringExpression = this.check(TOKEN_TYPE.STRING);
    if (isStringExpression) {
      this.consume(TOKEN_TYPE.STRING, "Expect '\"' before attribute value.");
      const right = this.stringStatement();
      return {
        type: 'AttributeStmt',
        left: { type: 'LiteralStmt', value: left.lexeme },
        right: right,
      };
    } else {
      const identifierToken = this.consume(
        TOKEN_TYPE.IDENTIFIER,
        "Expect identifier after '='."
      );
      return {
        type: 'AttributeStmt',
        left: { type: 'LiteralStmt', value: left.lexeme },
        right: { type: 'LiteralStmt', value: identifierToken.lexeme },
      };
    }
  }

  private ifStatement(): Stmt {
    this.consume(TOKEN_TYPE.WHITESPACE, 'Expect WHITESPACE after {{#if ');
    const condition = this.consume(
      TOKEN_TYPE.IDENTIFIER,
      'Expecting condition variable'
    );
    this.consume(
      TOKEN_TYPE.MUSTASHES_CLOSE,
      'Expect }} at the end of #if statement'
    );

    const trueStatements = [];
    while (
      !this.check(TOKEN_TYPE.MUSTASHES_OPEN) &&
      !this.check(TOKEN_TYPE.EOF)
    ) {
      const statement = this.getStatement();
      if (statement) {
        trueStatements.push(statement);
      }
    }

    this.consume(
      TOKEN_TYPE.MUSTASHES_OPEN,
      'Expect closing or else block in if block'
    );

    const withElseBlock = this.check(KEYWORDS.else);

    const falseStatements = [];
    if (withElseBlock) {
      this.consume(KEYWORDS.else, 'Expect else keyword');
      this.consume(
        TOKEN_TYPE.MUSTASHES_CLOSE,
        'Expect }} at the end of else statement'
      );

      while (
        !this.check(TOKEN_TYPE.MUSTASHES_OPEN) &&
        !this.check(TOKEN_TYPE.EOF)
      ) {
        const statement = this.getStatement();
        if (statement) {
          falseStatements.push(statement);
        }
      }

      this.consume(
        TOKEN_TYPE.MUSTASHES_OPEN,
        'Expect closing block in if block'
      );
    }

    this.consume(TOKEN_TYPE.SLASH, "Expect '/' in closing if block");
    this.consume(KEYWORDS.if, 'Expect if keyword in closing if block');
    this.consume(
      TOKEN_TYPE.MUSTASHES_CLOSE,
      'Expect }} at the end of closing if statement'
    );

    return {
      type: 'IfStmt',
      condition: condition.lexeme,
      thenBranch: trueStatements,
      elseBranch: falseStatements,
    };
  }

  match(...types: Token['type'][]): boolean {
    let counter = 0;
    for (let i = 0; i < types.length; i++) {
      if (this.check(types[i])) {
        this.advance();
        counter++;
      } else {
        break;
      }
    }

    if (counter === types.length) {
      return true;
    }

    for (let i = 0; i < counter; i++) {
      this.goBack();
    }

    return false;
  }

  check(type: Token['type']): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
  }

  goBack() {
    if (this.current > 0) this.current--;
  }

  advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() {
    return this.peek().type == TOKEN_TYPE.EOF;
  }

  peek(): Token {
    return this.tokens[this.current];
  }

  previous(): Token {
    return this.tokens[this.current - 1];
  }
}

export default Parser;
