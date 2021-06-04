// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { updateDecorations } from './gutters';
import { Logger } from './logging';
import { State } from './models';
import { updateStatusBarItem } from './statusbar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  State.extensionContext = context;
  Logger.info('Starting up Legato', false, 'Legato');
  let { activeTextEditor } = vscode.window;

  addSubscriptions();
  addEventHandlers();

  // context.subscriptions.push(disposable);

  if (activeTextEditor) {
    triggerUpdateDecorations();
    updateStatusBarItem();
  }

}

let timeout: NodeJS.Timer | undefined = undefined;

function addEventHandlers() {
  const { extensionContext: context } = State;
  let { activeTextEditor } = vscode.window;

  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      activeTextEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
        updateStatusBarItem();
      }
    },
    null,
    context.subscriptions,
  );

  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (activeTextEditor && event.document === activeTextEditor.document) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions,
  );

  vscode.window.onDidChangeTextEditorSelection(
    event => {  
      updateStatusBarItem();  
    },
    null,
    context.subscriptions,
  );
}

function triggerUpdateDecorations() {
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }
  timeout = setTimeout(updateDecorations, 500);
}

function addSubscriptions() {
  State.extensionContext.subscriptions.push(Logger.getChannel());
}

// this method is called when your extension is deactivated
export function deactivate() {}
