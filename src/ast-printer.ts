import type {
  AttributeStmt,
  EachStmt,
  HtmlSelfClosingTagStmt,
  HtmlTagStmt,
  IfStmt,
  LiteralStmt,
  MustacheStmt,
  PartialStmt,
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
  htmlDocument: string = '';
  ctx: any;
  partials: { [key: string]: Stmt[] };

  constructor(partials: { [key: string]: Stmt[] }) {
    this.partials = partials;
  }

  print(statements: Stmt[], ctx?: any): string {
    this.htmlDocument = '';
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
      case 'HtmlSelfClosingTagStmt':
        return this.visitHtmlSelfClosingTagStmt(stmt);
      case 'MustacheStmt':
        return this.visitMustacheStmt(stmt);
      case 'AttributeStmt':
        return this.visitAttributeStmt(stmt);
      case 'StringStmt':
        return this.visitStringStmt(stmt);
      case 'IfStmt':
        return this.visitIfStmt(stmt);
      case 'PartialStmt':
        return this.visitPartialStmt(stmt);
      case 'EachStmt':
        return this.visitEachStmt(stmt);
      default:
        throw new Error(`Unknown statement type: ${stmt.type}`);
    }
  }

  visitLiteralStmt(stmt: LiteralStmt): string {
    return stmt.value;
  }

  visitEachStmt(stmt: EachStmt): string {
    const iteratorKey = stmt.name;
    const arrayToIterate = this.getNestedValue(iteratorKey);
    let result = '';
    for (const item of arrayToIterate) {
      result += this.print(stmt.children, { ...this.ctx, [stmt.alias]: item });
    }

    return result;
  }

  visitPartialStmt(stmt: PartialStmt): string {
    const partialName = stmt.name;
    const partialCtx: any = { ...this.ctx };
    for (const attr of stmt.attributes ?? []) {
      if (attr.type === 'AttributeStmt') {
        const key = attr.left.value;
        let value: any;

        if (attr.right.type === 'LiteralStmt') {
          // attribute is a variable passed from context
          value = this.getNestedValue(attr.right.value);
        } else if (attr.right.type === 'StringStmt') {
          // attribute is a string
          value = this.printStmt(attr.right);
        } else if (attr.right.type === 'ChildrenStmt') {
          // children passed to slot component
          value = this.print(attr.right.children ?? [], partialCtx);
        }
        partialCtx[key] = value;
      }
    }

    return this.print(this.partials[partialName] ?? [], partialCtx);
  }

  visitHtmlTagStmt(stmt: HtmlTagStmt): string {
    let result = `<${stmt.tag}`;

    for (const attribute of stmt?.attributes ?? []) {
      result += this.printStmt(attribute);
    }
    result += '>';

    for (const child of stmt?.children ?? []) {
      result += this.printStmt(child);
    }
    result += `</${stmt.tag}>`;
    return result;
  }

  visitHtmlSelfClosingTagStmt(stmt: HtmlSelfClosingTagStmt): string {
    let result = `<${stmt.tag}`;

    for (const attribute of stmt?.attributes ?? []) {
      result += this.printStmt(attribute);
    }
    result += '/>';
    return result;
  }

  visitMustacheStmt(stmt: MustacheStmt): string {
    return this.getNestedValue(stmt.variable);
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
      for (const stmt of ifStmt.elseBranch ?? []) {
        result += this.printStmt(stmt);
      }
    }
    return result;
  }

  private getNestedValue(variable: string): any {
    const nestedKeys = variable.split('.');
    let value = this.ctx;
    for (const key of nestedKeys) {
      value = value?.[key];
      if (value === undefined) {
        value = undefined;
      }
    }
    return value;
  }
}

export default AstPrinter;
