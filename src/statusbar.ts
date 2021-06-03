import * as vscode from 'vscode';
import { State } from './models';

const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

export const getStatusBarItem = () => {
    updateStatusBarItem();
    return myStatusBarItem;
}

export function updateStatusBarItem() {

    const sbi = myStatusBarItem;

    const n = getLineNumber(vscode.window.activeTextEditor);

	if (10 <= n && n <= 100) {
		sbi.text = `$(milestone) Line: ${n}`;
		sbi.show();
	} else {
		clearStatusBarItem();
	}

}

function clearStatusBarItem() {
    const sbi = myStatusBarItem;
    sbi.text = '';
    sbi.hide();
}

function getLineNumber(editor: vscode.TextEditor | undefined): number {
	let line = 0;
	if (editor) {
		line = editor.selection.active.line;
	}
	return line;
}