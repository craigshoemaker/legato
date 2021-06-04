import * as vscode from 'vscode';
import { isValidFile } from './document';
import { patterns, Tab } from './models';

const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

/**
 * @description Update StatusBarItem with name of active tab, otherwise hide.
 * @returns
 */
export function updateStatusBarItem() {
  if (!isValidFile()) {
    clearStatusBarItem();
    return;
  }

  const tabs = getTabs();
  const currentLine = getLineNumber(vscode.window.activeTextEditor);
  let statusText = '';

  for (let i = 0; i < tabs.length - 1; i++) {
    if (tabs[i].line <= currentLine && currentLine < tabs[i + 1].line) {
      if (tabs[i].text) {
        statusText = `$(milestone) Tab: ${tabs[i].text}`;
        myStatusBarItem.text = statusText;
        myStatusBarItem.show();
        break;
      }
    }
  }
  if (!statusText) {
    clearStatusBarItem();
  }
}

/**
 * @description Clear text and hide statusBarItem.
 * @returns
 */
function clearStatusBarItem() {
  myStatusBarItem.text = '';
  myStatusBarItem.hide();
}

/**
 * @description Get line number of active cursor position.
 * @param editor
 * @returns line number
 */
function getLineNumber(editor: vscode.TextEditor | undefined): number {
  let line = 0;
  if (editor) {
    line = editor.selection.active.line;
  }
  return line;
}

/**
 * @description Create an array of tabs including the start line and text label.
 * @returns array of tabs
 */
function getTabs(): Array<Tab> {
  if (!vscode.window.activeTextEditor) {
    return [];
  }

  // regex returns the tab name in a capture group
  const regEx = patterns.tabs.regex;
  const text = vscode.window.activeTextEditor.document.getText();
  let tabs: Tab[] = [];
  let match: RegExpExecArray | null;

  // add each regex match to the tabs array
  while ((match = regEx.exec(text))) {
    const { positionAt } = vscode.window.activeTextEditor.document;
    const startPos = positionAt(match.index);
    tabs.push({ line: startPos.line, text: match[1] });
  }
  return tabs;
}
