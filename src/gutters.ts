import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { Logger } from './logging';
import { Area, colors } from './models';

let nextColorIndex = 0;
let scopeDecorations: vscode.TextEditorDecorationType[] = [];

/**
 * @description Find the matches for the tokens. Create a range using the line numbers. Then decorate the range using the pre-defined colors.
 */
export function updateDecorations() {
  let { activeTextEditor } = vscode.window;
  disposeScopeDecorations();
  nextColorIndex = 0;

  if (!activeTextEditor) {
    return;
  }

  const regEx = /# \[(.*)\]|---/gi;
  const fileName = activeTextEditor.document.fileName;
  const text = activeTextEditor.document.getText();
  let areas: Area[] = [];
  let match;
  Logger.info(`Setting Gutters to ${fileName}`);

  let skipper = 0;
  while ((match = regEx.exec(text))) {
    // TODO: This is a hack.
    // Skip the first 2 matches, because our regEx isn't excluding the top metadata
    skipper++;
    if (skipper <= 2) {
      continue;
    }

    const { decorationOptions, decorationType } = getDecorations(activeTextEditor, match);
    areas.push({ decorationOptions, decorationType });
  }
  areas = extendAreaToCoverEntireRange(areas);
  applyGutters(areas);
}

/**
 * @description Find the start and end positions where we match the regEx for the tab area.
 * @param activeTextEditor
 * @param match The regEx to match
 * @returns
 */
function getDecorations(activeTextEditor: vscode.TextEditor, match: RegExpExecArray) {
  const { positionAt } = activeTextEditor.document;
  const startPos = positionAt(match.index);
  const endPos = positionAt(match.index + match[0].length);

  // Create the deco options using the range.
  const decorationOptions = {
    range: new vscode.Range(startPos, endPos),
    hoverMessage: match[0],
  };

  // Set the color for the gutterIcon to rotate through our color constants.
  const decorationType = vscode.window.createTextEditorDecorationType({
    gutterIconPath: createIcon(getColor()),
    gutterIconSize: 'auto',
  });
  return { decorationOptions, decorationType };
}

/**
 * Get the next color in the constants array
 * @returns The next color
 */
function getColor() {
  const index = nextColorIndex % colors.length;
  nextColorIndex++;
  return colors[index].value;
}

/**
 * @description Sets the decorations to the gutter.
 * @param areas The areas (ranges and decorations) to apply to the gutters
 */
function applyGutters(areas: Area[]) {
  let { activeTextEditor } = vscode.window;
  areas.forEach((area) => {
    scopeDecorations.push(area.decorationType);
    activeTextEditor?.setDecorations(area.decorationType, [area.decorationOptions]);
  });
}

/**
 * @description Create the gutter icon.
 * @param color Icon color
 * @returns The Uri for the SVG icon
 */
function createIcon(color: string): Uri {
  const lineHeight = vscode.workspace.getConfiguration('editor').lineHeight;
  const width = 2;
  const offset = lineHeight - width; // right-aligned
  const transparency = 99;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" height="${lineHeight}" width="${lineHeight}">` +
    `<rect x="${offset}" y="0" width="${width}" height="100" style="fill: ${color}${transparency};"></rect>;` +
    `</svg>`;

  const encodedSVG = encodeURIComponent(svg);
  const URI = 'data:image/svg+xml;utf8,' + encodedSVG;
  return Uri.parse(URI);
}

/**
 * Remove all scope decorations.
 * This is required so we can constantly update the gutter.
 */
function disposeScopeDecorations() {
  for (const decoration of scopeDecorations) {
    decoration.dispose();
  }

  scopeDecorations = [];
}

/**
 * @description Extend the ranges of each match in the array to the next match. This is what decorates the entire range in the gutter.
 * @param areas array of the styles and ranges for the gutter
 * @returns a fresh copy of the areas array
 */
function extendAreaToCoverEntireRange(areas: Area[]) {
  let previousArea: Area;
  areas.forEach((area) => {
    const { line } = area.decorationOptions.range.start;

    if (previousArea) {
      const { line: startLine } = previousArea.decorationOptions.range.start;
      previousArea.decorationOptions.range = new vscode.Range(startLine, 0, line - 1, 0);
    }

    previousArea = area;
  });
  return areas;
}
