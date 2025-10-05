import { Token } from './token.js';
import { ErrorReporter } from './error-reporter.js';
import { KEYWORDS, TOKEN_TYPE } from './token-types.js';

export class Scanner extends ErrorReporter {
  source: string;
  tokens: Token[];
  start: number;
  current: number;
  line: number;

  constructor(source: string) {
    super();
    this.source = source;
    this.current = 0;
    this.tokens = [];
    this.line = 1;
    this.start = 0;
    this.current = 0;
  }

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(new Token('EOF', '', null, this.line));
    return this.tokens;
  }

  isBlockOpen() {
    if (this.peek() !== '{') {
      return false;
    }
    const isBlockOpen = this.match('{') && this.match('#');
    if (!isBlockOpen) {
      this.current -= 1;
      return false;
    }
    return true;
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case '{':
        this.addToken(
          this.match('{')
            ? this.match('/')
              ? TOKEN_TYPE.BLOCK_CLOSE
              : TOKEN_TYPE.MUSTASHES_OPEN
            : TOKEN_TYPE.CURLY_OPEN
        );
        break;
      case '}':
        this.addToken(
          this.match('}') ? TOKEN_TYPE.MUSTASHES_CLOSE : TOKEN_TYPE.CURLY_CLOSE
        );
        break;

      case '<':
        this.addToken(this.match('/') ? TOKEN_TYPE.TAG_CLOSE : TOKEN_TYPE.LESS);
        break;
      case '>':
        this.addToken(TOKEN_TYPE.GREATER);
        break;

      case '/':
        this.addToken(
          this.match('>') ? TOKEN_TYPE.SELF_CLOSING : TOKEN_TYPE.SLASH
        );
        break;

      case '=':
        this.addToken(TOKEN_TYPE.EQUAL);
        break;

      case '"':
        this.addToken(TOKEN_TYPE.STRING);
        this.string();
        break;

      case '#':
        this.addToken(TOKEN_TYPE.HASH);
        break;

      case '\n':
        this.addToken(TOKEN_TYPE.NEWLINE);
        this.line++;
        break;

      case ' ':
        this.addToken(TOKEN_TYPE.WHITESPACE);
        break;
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.identifier();
        } else {
          this.error(this.line, `Unexpected character: ${c}`);
        }
    }
  }

  advance() {
    this.current++;
    return this.source[this.current - 1];
  }

  addToken(type: string, literal = null) {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  match(expected: string) {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;

    this.current++;
    return true;
  }

  peek() {
    if (this.isAtEnd()) {
      return null;
    }
    return this.source[this.current];
  }

  string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') {
        this.line++;
      }
      this.start = this.current;
      this.scanToken();
    }

    if (this.isAtEnd()) {
      this.error(this.line, 'Unterminated string.');
      return;
    }

    const closingString = this.advance();
    if (closingString !== '"') {
      this.error(this.line, 'Unterminated string.');
      return;
    }

    this.addToken(TOKEN_TYPE.STRING);
  }

  isDigit(c: string | null) {
    if (c === null) {
      return false;
    }
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(c);
  }

  number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }
    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    this.addToken(TOKEN_TYPE.NUMBER);
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) {
      return null;
    }
    return this.source[this.current + 1];
  }

  isAlpha(c: string) {
    return (
      (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      c == '_' ||
      c == '+' ||
      c == '-' ||
      c == ',' ||
      c == '.' ||
      c == ':' ||
      c == '@' ||
      c == '$' ||
      c == '!' ||
      c == '?'
    );
  }

  isAlphaNumeric(c: string | null) {
    if (c === null) {
      return false;
    }
    return this.isAlpha(c) || this.isDigit(c);
  }

  identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const text = this.source.slice(this.start, this.current);
    const keyword = KEYWORDS[text];
    this.addToken(keyword || TOKEN_TYPE.IDENTIFIER);
  }
}
