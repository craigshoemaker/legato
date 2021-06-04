import * as vscode from 'vscode';

export const extensionShortName = 'legato';
export const extensionId = 'craigshoemaker.vscode-legato';
export const legatoSection = 'legato';

// export const timeout = async (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const isObjectEmpty = (o: {} | undefined) =>
  typeof o === 'object' && Object.keys(o).length === 0;

export const colors = [
  // { name: 'Light Blue', value: '#61dafb' },
  // { name: 'Yellow', value: '#f9e64f' },
  { name: 'Orange', value: '#ff3d00' },
  { name: 'Green', value: '#42b883' },
  { name: 'Blue', value: '#007fff' },
  { name: 'Purple', value: '#832561' },
];
