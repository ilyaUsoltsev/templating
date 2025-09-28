import { Token } from './token.js';
import { ErrorReporter } from './error-reporter.js';
import { KEYWORDS, TOKEN_TYPE } from './token-types.js';

export class Scanner extends ErrorReporter {
  source: string;
  tokens: Token[];
  start: number;
  current: number;
  line: number;

  constructor(source) {
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

  isBlockClose() {
    if (this.peek() !== '{') {
      return false;
    }
    const isBlockClose = this.match('{') && this.match('/');
    if (!isBlockClose) {
      this.current -= 1;
      return false;
    }
    return true;
  }

  scanToken() {
    const c = this.advance();
    switch (c) {
      case '{':
        if (this.isBlockOpen()) {
          this.addToken(TOKEN_TYPE.BLOCK_OPEN);
        } else if (this.isBlockClose()) {
          this.addToken(TOKEN_TYPE.BLOCK_CLOSE);
        } else {
          this.addToken(
            this.match('{') ? TOKEN_TYPE.MUSTASHES_OPEN : TOKEN_TYPE.CURLY_OPEN
          );
        }
        break;
      case '}':
        this.addToken(
          this.match('}') ? TOKEN_TYPE.MUSTASHES_CLOSE : TOKEN_TYPE.CURLY_CLOSE
        );
        break;

      case '<':
        this.addToken(TOKEN_TYPE.TAG_OPEN);
        break;
      case '>':
        this.addToken(TOKEN_TYPE.TAG_CLOSE);
        break;

      case '/':
        this.addToken(TOKEN_TYPE.SLASH);
        break;

      case '"':
        this.string();
        break;
      case '\n':
        this.line++;
        break;

      case ' ':
      case '\r':
      case '\t':
        // Ignore whitespace.
        break;

      default:
        if (this.isDigit(c)) {
          this.number();
        } else if (this.isAlpha(c)) {
          this.idenfifier();
        } else {
          this.error(this.line, `Unexpected character: ${c}`);
        }
    }
  }

  advance() {
    this.current++;
    return this.source[this.current - 1];
  }

  addToken(type, literal = null) {
    const text = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(type, text, literal, this.line));
  }

  isAtEnd() {
    return this.current >= this.source.length;
  }

  match(expected) {
    if (this.isAtEnd()) return false;
    if (this.source[this.current] !== expected) return false;

    this.current++;
    return true;
  }

  peek() {
    if (this.isAtEnd()) return null;
    return this.source[this.current];
  }

  string() {
    while (this.peek() !== '"' && !this.isAtEnd()) {
      if (this.peek() === '\n') this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      this.error(this.line, 'Unterminated string.');
      return;
    }

    this.advance();

    const value = this.source.slice(this.start + 1, this.current - 1);
    this.addToken(TOKEN_TYPE.STRING, value);
  }

  isDigit(c) {
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
    const result = parseFloat(this.source.slice(this.start, this.current));
    const isInt = Number.isInteger(result);

    this.addToken(TOKEN_TYPE.NUMBER, isInt ? result.toFixed(1) : result);
  }

  peekNext() {
    if (this.current + 1 >= this.source.length) return null;
    return this.source[this.current + 1];
  }

  isAlpha(c) {
    return (
      (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      c == '_' ||
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

  isAlphaNumeric(c) {
    return this.isAlpha(c) || this.isDigit(c);
  }

  idenfifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }
    const text = this.source.slice(this.start, this.current);
    const keyword = KEYWORDS[text];
    this.addToken(keyword || TOKEN_TYPE.IDENTIFIER);
  }
}
