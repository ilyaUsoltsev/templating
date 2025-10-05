import { Scanner } from './scanner';
import Parser from './parser';
import AstPrinter from './ast-printer';
import type { Stmt } from './ast';

const partials: { [key: string]: Stmt[] } = {};

export function registerPartials(name: string, template: string) {
  const scanner = new Scanner(template);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const statements = parser.parse(tokens);
  partials[name] = statements;
}

export function compile(fileContent: string) {
  const scanner = new Scanner(fileContent);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const statements = parser.parse(tokens);
  const ast = new AstPrinter(partials);

  return (ctx: any) => ast.print(statements, ctx);
}
