export type LiteralStmt = { type: 'LiteralStmt'; value: any };

export type StringStmt = { type: 'StringStmt'; children: Stmt[] };

export type AttributeStmt = {
  type: 'AttributeStmt';
  left: LiteralStmt;
  right: Stmt;
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
  | StringStmt;
