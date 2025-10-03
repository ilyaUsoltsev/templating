import * as fs from 'fs';
import path from 'path';
import { Scanner } from './scanner';
import Parser from './parser';
import AstPrinter from './ast-printer';

const filePath = path.join(__dirname, 'test.handlebars');
const fileContent = fs.readFileSync(filePath, 'utf8');

const scanner = new Scanner(fileContent);
const tokens = scanner.scanTokens();
for (const token of tokens) {
  console.log(token.toString());
}
const parser = new Parser(tokens);
const statements = parser.parse(tokens);
const ast = new AstPrinter();
const printedAst = ast.print(statements, {
  userId: 'user123',
  greetingClass: 'grueziClass',
  name: 'Peter',
});

console.log('---------------------------');
console.log(JSON.stringify(statements, null, 2));
console.log('---------------------------');
console.log(printedAst);
