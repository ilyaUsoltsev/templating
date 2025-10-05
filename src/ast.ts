export type LiteralStmt = { type: 'LiteralStmt'; value: any };

export type StringStmt = { type: 'StringStmt'; children: Stmt[] };

export type ChildrenStmt = { type: 'ChildrenStmt'; children: Stmt[] };

export type EachStmt = {
  type: 'EachStmt';
  name: string;
  alias: string;
  children: Stmt[];
};

export type PartialStmt = {
  type: 'PartialStmt';
  name: string;
  attributes?: Stmt[];
};

export type SlotStmt = {
  type: 'SlotStmt';
  name: string;
  attributes?: Stmt[];
  children: Stmt[];
};

export type AttributeStmt = {
  type: 'AttributeStmt';
  left: LiteralStmt;
  right: StringStmt | LiteralStmt | ChildrenStmt;
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

export type HtmlSelfClosingTagStmt = {
  type: 'HtmlSelfClosingTagStmt';
  tag: string;
  attributes?: Stmt[];
};

export type MustacheStmt = {
  type: 'MustacheStmt';
  variable: string;
};

export type Stmt =
  | ProgramStmt
  | HtmlTagStmt
  | HtmlSelfClosingTagStmt
  | MustacheStmt
  | LiteralStmt
  | AttributeStmt
  | StringStmt
  | IfStmt
  | PartialStmt
  | SlotStmt
  | ChildrenStmt
  | EachStmt;
