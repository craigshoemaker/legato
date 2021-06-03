import * as vscode from 'vscode';

export const extensionShortName = 'legato';
export const extensionId = 'craigshoemaker.vscode-legato';

// export const timeout = async (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const isObjectEmpty = (o: {} | undefined) => typeof o === 'object' && Object.keys(o).length === 0;

export const colors = [
  { name: 'React Blue', value: '#61dafb' },
  { name: 'JavaScript Yellow', value: '#f9e64f' },
  { name: 'Svelte Orange', value: '#ff3d00' },
  { name: 'Vue Green', value: '#42b883' },
  { name: 'Azure Blue', value: '#007fff' },
  { name: 'Something Different', value: '#832561' },
];
