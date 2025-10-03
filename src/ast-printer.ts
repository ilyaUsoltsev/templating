import {
  AttributeStmt,
  HtmlTagStmt,
  LiteralStmt,
  MustacheStmt,
  Stmt,
  StringStmt,
} from './ast';

interface Visitor {
  visitLiteralExpr(stmt: LiteralStmt): string;
  visitHtmlTagStmt(stmt: HtmlTagStmt): string;
  visitMustacheStmt(stmt: MustacheStmt): string;
  visitAttributeStmt(stmt: AttributeStmt): string;
  visitStringStmt(stmt: StringStmt): string;
}

class AstPrinter implements Visitor {
  htmlDocument: string;

  constructor() {
    this.htmlDocument = '';
  }

  print(statements: Stmt[]): string {
    for (const stmt of statements) {
      this.htmlDocument += this.printStmt(stmt);
    }
    return this.htmlDocument;
  }

  printStmt(stmt: Stmt): string {
    switch (stmt.type) {
      case 'LiteralStmt':
        return this.visitLiteralExpr(stmt);
      case 'HtmlTagStmt':
        return this.visitHtmlTagStmt(stmt);
      case 'MustacheStmt':
        return this.visitMustacheStmt(stmt);
      case 'AttributeStmt':
        return this.visitAttributeStmt(stmt);
      case 'StringStmt':
        return this.visitStringStmt(stmt);
      default:
      // throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }

  visitLiteralExpr(stmt: LiteralStmt): string {
    return 'Literal STMT';
  }
  visitHtmlTagStmt(stmt: HtmlTagStmt): string {
    let result = `<${stmt.tag} `;
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
    return 'MustacheStmt';
  }
  visitAttributeStmt(stmt: AttributeStmt): string {
    return 'AttributeStmt';
  }
  visitStringStmt(stmt: StringStmt): string {
    return 'StringStmt';
  }
}

export default AstPrinter;
