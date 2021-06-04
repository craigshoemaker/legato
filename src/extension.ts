import * as vscode from 'vscode';
import { addEventHandlers } from './event-handlers';
import { triggerUpdateDecorations } from './decorations';
import { Logger } from './logging';
import { State } from './models';
import { updateStatusBarItem } from './statusbar';

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

function addSubscriptions() {
  State.extensionContext.subscriptions.push(Logger.getChannel());
}

export function deactivate() {}
