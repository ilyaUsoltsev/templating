import { MustacheStmt, Stmt } from './ast';
import { Token } from './token';
import { TOKEN_TYPE } from './token-types';

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

  private getStatement(): Stmt {
    if (this.match(TOKEN_TYPE.MUSTASHES_OPEN)) {
      return this.mustachesStatement();
    }

    if (this.match(TOKEN_TYPE.LESS)) {
      return this.tagStatement();
    }

    if (this.match(TOKEN_TYPE.STRING)) {
      return this.stringStatement();
    }

    if (
      this.match(TOKEN_TYPE.IDENTIFIER, TOKEN_TYPE.EQUAL, TOKEN_TYPE.STRING)
    ) {
      console.log('attribute detected');
      return this.attributeStatement();
    }

    this.advance();
  }

  private match(...types: Token['type'][]): boolean {
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

  private mustachesStatement(): MustacheStmt {
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
    const identifierToken = this.consume(
      TOKEN_TYPE.IDENTIFIER,
      "Expect tag name after '<'."
    );

    const statements: Stmt[] = [];

    while (!this.check(TOKEN_TYPE.GREATER) && !this.check(TOKEN_TYPE.EOF)) {
      const statement = this.getStatement();
      if (statement) {
        statements.push(statement);
      }
    }

    this.consume(TOKEN_TYPE.GREATER, "Expect '>' after tag name.");

    return {
      type: 'HtmlTagStmt',
      tag: identifierToken.lexeme,
      attributes: statements,
    };
  }

  private stringStatement(): Stmt {
    const stringToken = this.previous();
    this.advance();
    return {
      type: 'LiteralExpr',
      value: stringToken.literal,
    };
  }

  private identifierStatement(): Stmt {
    const identifier = this.consume(
      TOKEN_TYPE.IDENTIFIER,
      `Expect identifier. Not ${this.peek().type}`
    );

    return {
      type: 'LiteralExpr',
      value: identifier.lexeme,
    };
  }

  private attributeStatement(): Stmt {
    this.goBack();
    this.goBack();
    this.goBack();
    // we are at IDENTIFIER
    const left = this.consume(
      TOKEN_TYPE.IDENTIFIER,
      'Expect identifier at attribute statement start.'
    );

    this.consume(TOKEN_TYPE.EQUAL, "Expect '=' after attribute name.");
    const right = this.consume(TOKEN_TYPE.STRING, "Expect string after '='.");
    return {
      type: 'AttributeStmt',
      left: { type: 'LiteralExpr', value: left.lexeme },
      right: { type: 'LiteralExpr', value: right.literal },
    };
  }
}

export default Parser;
