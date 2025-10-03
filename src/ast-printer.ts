import {
  AttributeStmt,
  HtmlTagStmt,
  IfStmt,
  LiteralStmt,
  MustacheStmt,
  Stmt,
  StringStmt,
} from './ast';

interface Visitor {
  visitLiteralStmt(stmt: LiteralStmt): string;
  visitHtmlTagStmt(stmt: HtmlTagStmt): string;
  visitMustacheStmt(stmt: MustacheStmt): string;
  visitAttributeStmt(stmt: AttributeStmt): string;
  visitStringStmt(stmt: StringStmt): string;
}

class AstPrinter implements Visitor {
  htmlDocument: string;
  ctx: any;

  constructor() {
    this.htmlDocument = '';
  }

  print(statements: Stmt[], ctx?: any): string {
    this.ctx = ctx;
    for (const stmt of statements) {
      this.htmlDocument += this.printStmt(stmt);
    }
    return this.htmlDocument;
  }

  printStmt(stmt: Stmt): string {
    switch (stmt.type) {
      case 'LiteralStmt':
        return this.visitLiteralStmt(stmt);
      case 'HtmlTagStmt':
        return this.visitHtmlTagStmt(stmt);
      case 'MustacheStmt':
        return this.visitMustacheStmt(stmt);
      case 'AttributeStmt':
        return this.visitAttributeStmt(stmt);
      case 'StringStmt':
        return this.visitStringStmt(stmt);
      case 'IfStmt':
        return this.visitIfStmt(stmt);
      default:
      // throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }

  visitLiteralStmt(stmt: LiteralStmt): string {
    return stmt.value;
  }

  visitHtmlTagStmt(stmt: HtmlTagStmt): string {
    let result = `<${stmt.tag}`;

    for (const attribute of stmt.attributes) {
      result += this.printStmt(attribute);
    }
    result += '>';

    for (const child of stmt.children) {
      result += this.printStmt(child);
    }
    result += `</${stmt.tag}>`;
    return result;
  }

  visitMustacheStmt(stmt: MustacheStmt): string {
    return `${this.ctx[stmt.variable] ?? ''}`;
  }

  visitAttributeStmt(stmt: AttributeStmt): string {
    let result = this.printStmt(stmt.left);
    result += '=';
    result += `"${this.printStmt(stmt.right)}"`;
    return result;
  }

  visitStringStmt(stmt: StringStmt): string {
    let result = '';

    for (const child of stmt.children) {
      result += this.printStmt(child);
    }

    return result;
  }

  visitIfStmt(ifStmt: IfStmt): string {
    let result = '';
    const condition = this.ctx[ifStmt.condition];
    if (condition) {
      for (const stmt of ifStmt.thenBranch) {
        result += this.printStmt(stmt);
      }
    } else {
      for (const stmt of ifStmt.elseBranch) {
        result += this.printStmt(stmt);
      }
    }
    return result;
  }
}

export default AstPrinter;
