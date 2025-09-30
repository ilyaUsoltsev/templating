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
    } else {
      this.advance();
    }
  }

  private match(...types: Token['type'][]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  check(type: Token['type']): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type == type;
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
}

export default Parser;
