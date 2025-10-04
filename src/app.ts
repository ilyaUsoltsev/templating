import * as fs from 'fs';
import path from 'path';
import { Scanner } from './scanner';
import Parser from './parser';
import AstPrinter from './ast-printer';
import { Stmt } from './ast';

const partials = {} as { [key: string]: Stmt[] };

const partialFileNames = [
  'Dialog.handlebars',
  'Button.handlebars',
  'Container.handlebars',
];

for (const fileName of partialFileNames) {
  const partialPath = path.join(__dirname, fileName);
  const partialFileContent = fs.readFileSync(partialPath, 'utf8');
  const partialScanner = new Scanner(partialFileContent);
  const partialTokens = partialScanner.scanTokens();
  const partialParser = new Parser(partialTokens);
  const partialStatements = partialParser.parse(partialTokens);
  const key = path.basename(fileName, path.extname(fileName));
  partials[key] = partialStatements;
}

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
  messages: [
    { text: 'Text1', user: 'User1' },
    { text: 'Text2', user: 'User2' },
  ],
});

console.log('---------------------------');
console.log(JSON.stringify(statements, null, 2));
console.log('---------------------------');
console.log(printedAst);
