import { Token } from './token';
import { TOKEN_TYPE } from './token-types';

class Parser {
  tokens: Token[];
  current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse() {}

  check(type: string): boolean {
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
}

export default Parser;
