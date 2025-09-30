import * as fs from 'fs';
import path from 'path';
import { Scanner } from './scanner';
import Parser from './parser';

const filePath = path.join(__dirname, 'test.handlebars');
const fileContent = fs.readFileSync(filePath, 'utf8');

const scanner = new Scanner(fileContent);
const tokens = scanner.scanTokens();
const parser = new Parser(tokens);
const statements = parser.parse(tokens);

for (const token of tokens) {
  console.log(token.toString());
}

console.log('Parsed Tokens:');

console.log('Parsed Statements:');
console.log(JSON.stringify(statements, null, 2));
