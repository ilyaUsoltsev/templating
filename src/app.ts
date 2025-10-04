import { Scanner } from './scanner';
import Parser from './parser';
import AstPrinter from './ast-printer';

const partials = {};

export function registerPartials(name: string, template: string) {
  partials[name] = template;
}

export function compile(fileContent: string) {
  const scanner = new Scanner(fileContent);
  const tokens = scanner.scanTokens();
  const parser = new Parser(tokens);
  const statements = parser.parse(tokens);
  const ast = new AstPrinter(partials);

  return (ctx: any) => ast.print(statements, ctx);
}

export default {
  compile,
  registerPartials,
};
