import * as vscode from 'vscode';
import { SwitcherTypes } from './enums';

export interface Area {
  color: string;
  decorationOptions: vscode.DecorationOptions;
  decorationType: vscode.TextEditorDecorationType;
}

export interface Tab {
  line: number;
  text: string;
}

export interface Decoration {
  decorationOptions: vscode.DecorationOptions;
  decorationType: vscode.TextEditorDecorationType;
  color: string;
}

export type DecoratorFunction = (
  activeTextEditor: vscode.TextEditor,
  match: RegExpExecArray,
) => Decoration;

export interface AreaPattern {
  regex: RegExp;
  name: SwitcherTypes;
  getDecorations?: DecoratorFunction;
}
