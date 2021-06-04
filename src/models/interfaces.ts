import * as vscode from 'vscode';

export interface Area {
  color: string; 
  decorationOptions: vscode.DecorationOptions;
  decorationType: vscode.TextEditorDecorationType;
}

export interface Tab {
  line: number;
  text: string;
}
