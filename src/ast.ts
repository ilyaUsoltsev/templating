export type LiteralExpr = { type: 'LiteralExpr'; value: any };

export type StringStmt = { type: 'StringStmt'; children: Stmt[] };

export type AttributeStmt = {
  type: 'AttributeStmt';
  left: LiteralExpr;
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
  | LiteralExpr
  | AttributeStmt
  | StringStmt;
