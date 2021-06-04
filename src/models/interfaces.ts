import * as vscode from 'vscode';
import { Switchers } from './enums';

export interface Tab {
  line: number;
  text: string;
}

export interface AreaDecoration {
  decorationOptions: vscode.DecorationOptions;
  decorationType: vscode.TextEditorDecorationType;
  color: string;
  isEnd: boolean;
}

export type DecoratorFunction = (
  activeTextEditor: vscode.TextEditor,
  match: RegExpExecArray,
) => AreaDecoration;

export interface AreaPattern {
  regex: RegExp;
  name: Switchers;
  getDecorations?: DecoratorFunction;
}
