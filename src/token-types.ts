export const TOKEN_TYPE = {
  CURLY_OPEN: 'CURLY_OPEN', // {
  CURLY_CLOSE: 'CURLY_CLOSE', // }
  MUSTASHES_OPEN: 'MUSTASHES_OPEN', // {{
  MUSTASHES_CLOSE: 'MUSTASHES_CLOSE', // }}
  BLOCK_OPEN: 'BLOCK_OPEN', // {{#
  BLOCK_CLOSE: 'BLOCK_CLOSE', // {{/
  TAG_OPEN: 'TAG_OPEN', // <
  TAG_CLOSE: 'TAG_CLOSE', // >
  SLASH: 'SLASH', // /
  IDENTIFIER: 'IDENTIFIER', // variable names, function names, attributes
  STRING: 'STRING', // "string"
  EQUAL: 'EQUAL', // =
  NUMBER: 'NUMBER', // 123, 45.67
  EOF: 'EOF', // end of file
};

export const KEYWORDS: { [key: string]: string } = {
  if: 'IF',
  else: 'ELSE',
};
