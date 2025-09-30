export type LiteralExpr = { type: 'LiteralExpr'; value: any }; // Number, string, boolean
export type AttributeExpr = { type: 'Attribute'; name: string; value: Expr[] };

export type Expr = LiteralExpr | AttributeExpr;

export type ProgramStmt = {
  type: 'ProgramStmt';
  children: Stmt[];
};

export type HtmlTagStmt = {
  type: 'HtmlTagStmt';
  tag: string;
  attributes: AttributeExpr[];
  children: Stmt[];
};

export type MustacheStmt = {
  type: 'MustacheStmt';
  variable: string;
};

export type Stmt = ProgramStmt | HtmlTagStmt | MustacheStmt;
