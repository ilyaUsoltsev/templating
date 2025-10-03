export type LiteralStmt = { type: 'LiteralStmt'; value: any };

export type StringStmt = { type: 'StringStmt'; children: Stmt[] };

export type PartialStmt = {
  type: 'PartialStmt';
  name: string;
  attributes?: AttributeStmt[];
};

export type AttributeStmt = {
  type: 'AttributeStmt';
  left: LiteralStmt;
  right: StringStmt | MustacheStmt;
};

export type IfStmt = {
  type: 'IfStmt';
  condition: string; // variable name after {{#if condition
  thenBranch: Stmt[];
  elseBranch?: Stmt[];
};

export type ProgramStmt = {
  type: 'ProgramStmt';
  children: Stmt[];
};

export type HtmlTagStmt = {
  type: 'HtmlTagStmt';
  tag: string;
  attributes?: Stmt[];
  children?: Stmt[];
};

export type MustacheStmt = {
  type: 'MustacheStmt';
  variable: string;
};

export type Stmt =
  | ProgramStmt
  | HtmlTagStmt
  | MustacheStmt
  | LiteralStmt
  | AttributeStmt
  | StringStmt
  | IfStmt
  | PartialStmt;
