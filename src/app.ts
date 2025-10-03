import * as fs from 'fs';
import path from 'path';
import { Scanner } from './scanner';
import Parser from './parser';
import AstPrinter from './ast-printer';
import { Stmt } from './ast';

const partials: { Button: Stmt[] } = { Button: [] };

const buttonPath = path.join(__dirname, 'button.handlebars');
const buttonFileContent = fs.readFileSync(buttonPath, 'utf8');
const buttonScanner = new Scanner(buttonFileContent);
const buttonTokens = buttonScanner.scanTokens();
const buttonParser = new Parser(buttonTokens);
const buttonStatements = buttonParser.parse(buttonTokens);
partials['Button'] = buttonStatements;

const filePath = path.join(__dirname, 'test.handlebars');
const fileContent = fs.readFileSync(filePath, 'utf8');

const scanner = new Scanner(fileContent);
const tokens = scanner.scanTokens();
for (const token of tokens) {
  console.log(token.toString());
}

const parser = new Parser(tokens);
const statements = parser.parse(tokens);

const ast = new AstPrinter(partials);
const printedAst = ast.print(statements, {
  userId: 'user123',
  greetingClass: 'grueziClass',
  name: 'Peter',
  isMember: true,
});

console.log('---------------------------');
console.log(JSON.stringify(statements, null, 2));
console.log('---------------------------');
console.log(printedAst);
