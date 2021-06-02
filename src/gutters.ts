import * as vscode from 'vscode';
import { Uri } from 'vscode';
import { Area, colors } from './models';

let { activeTextEditor } = vscode.window;

export function updateDecorations() {
  if (!activeTextEditor) {
    return;
  }
  const regEx = /# \[(.*)\]|---/gi;
  const text = activeTextEditor.document.getText();
  const areas: Area[] = [];
  let match;
  let skipper = 0;
  while ((match = regEx.exec(text))) {
    /**
     * We skip the first 2 matches,
     * because our regEx isnt yet excluding
     * the top metadata material
     **/
    skipper++;
    if (skipper <= 2) {
      continue;
    }

    /**
     * Find the start and end positions where we match the regEx for the tab area.
     */
    const startPos = activeTextEditor.document.positionAt(match.index);
    const endPos = activeTextEditor.document.positionAt(match.index + match[0].length);

    /**
     * Create the deco options using the range.
     */
    const decorationOptions = {
      range: new vscode.Range(startPos, endPos),
      hoverMessage: match[0],
    };

    /**
     * Set the color for the gutterIcon to rotate through our color constants.
     */
    const index = areas.length % colors.length;
    const decorationType = vscode.window.createTextEditorDecorationType({
      gutterIconPath: createIcon(colors[index].value),
    });

    /**
     * Add the area to be colored in the gutters.
     */
    areas.push({ decorationOptions, decorationType });
  }

  /**
   * Modify the areas to cover the entire area.
   */
  let previousArea: Area;
  areas.forEach((area) => {
    const { line } = area.decorationOptions.range.start;

    if (previousArea) {
      const { line: startLine } = previousArea.decorationOptions.range.start;
      previousArea.decorationOptions.range = new vscode.Range(startLine, 0, line - 1, 0);
    }

    previousArea = area;
  });

  /**
   * Apply the gutters
   */
  areas.forEach((area) => {
    activeTextEditor?.setDecorations(area.decorationType, [area.decorationOptions]);
  });
}

function createIcon(color: string): Uri {
  const lineHeight = vscode.workspace.getConfiguration('editor').lineHeight;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" height="${lineHeight}" width="${lineHeight}">` +
    `<rect x="0" y="0" width="10" height="30" style="fill: ${color};"></rect>;` +
    `</svg>`;

  const encodedSVG = encodeURIComponent(svg);
  const URI = 'data:image/svg+xml;utf8,' + encodedSVG;
  return Uri.parse(URI);
}
