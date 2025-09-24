import * as fs from 'fs';
import path from 'path';
import { Scanner } from './scanner';

const filePath = path.join(__dirname, 'test.handlebars');
const fileContent = fs.readFileSync(filePath, 'utf8');

const scanner = new Scanner(fileContent);
const tokens = scanner.scanTokens();

for (const token of tokens) {
  console.log(token.toString());
}
