export class Token {
  type: string;
  lexeme: string;
  literal: any;
  line: number;

  constructor(type: string, lexeme: string, literal: any, line: number) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  toString() {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
