import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { Logger } from './logging';
import { Area, colors } from './models';

let { activeTextEditor } = vscode.window;

let scopeDecorations: vscode.TextEditorDecorationType[] = [];

/**
 * @description Find the matches for the tokens. Create a range using the line numbers. Then decorate the range using the pre-defined colors.
 */
export function updateDecorations() {
  disposeScopeDecorations();

  if (!activeTextEditor) {
    return;
  }

  Logger.info('Setting Gutters');

  const regEx = /# \[(.*)\]|---/gi;
  const text = activeTextEditor.document.getText();
  let areas: Area[] = [];
  let match;

  let skipper = 0;
  while ((match = regEx.exec(text))) {
    /**
     * TODO: This is a hack.
     * We skip the first 2 matches,
     * because our regEx isn't yet excluding
     * the top metadata material
     **/
    skipper++;
    if (skipper <= 2) {
      continue;
    }

    // Find the start and end positions where we match the regEx for the tab area.
    const { positionAt } = activeTextEditor.document;
    const startPos = positionAt(match.index);
    const endPos = positionAt(match.index + match[0].length);

    // Create the deco options using the range.
    const decorationOptions = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: match[0],
    };

    // Set the color for the gutterIcon to rotate through our color constants.
    const index = areas.length % colors.length;
    const decorationType = vscode.window.createTextEditorDecorationType({
      gutterIconPath: createIcon(colors[index].value),
      gutterIconSize: 'auto',
    });

    areas.push({ decorationOptions, decorationType });
  }

  areas = extendAreaToCoverEntireRange(areas);

  applyGutters(areas);
}

/**
 * @description Sets the decorations to the gutter.
 * @param areas The areas (ranges and decorations) to apply to the gutters
 */
function applyGutters(areas: Area[]) {
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
  const offset = 10;
  const width = 3;
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
