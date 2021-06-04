import * as vscode from 'vscode';
import {
  DecorationOptions,
  Range,
  TextEditor,
  TextEditorDecorationType,
  Uri,
  window,
} from 'vscode';
import {
  getGutterIndicatorHeight,
  getGutterIndicatorOffset,
  getGutterIndicatorOpacity,
  getGutterIndicatorWidth,
} from './configuration';
import { isValidFile } from './document';
import { Logger } from './logging';
import {
  Area,
  colors,
  GutterSVGs,
  getPattern,
  patternTypes,
  Decoration,
  SwitcherTypes,
} from './models';

let nextColorIndex = 0;
let scopeDecorations: TextEditorDecorationType[] = [];
let timeout: NodeJS.Timer | undefined = undefined;

/**
 * @description Trigger the decorations after a timeout delay
 */
export function triggerUpdateDecorations() {
  if (timeout) {
    clearTimeout(timeout);
    timeout = undefined;
  }
  timeout = setTimeout(updateDecorations, 500);
}

/**
 * @description Find the matches for the tokens. Create a range using the line numbers. Then decorate the range using the pre-defined colors.
 */
function updateDecorations() {
  let { activeTextEditor } = window;
  disposeScopeDecorations();
  nextColorIndex = 0;

  if (!activeTextEditor || !isValidFile()) {
    console.log('not a valid file');
    return;
  }

  const fileName = activeTextEditor.document.fileName;
  const text = activeTextEditor.document.getText();
  const pattern = getPattern(text);
  const regEx = pattern.regex;
  let areas: Area[] = [];
  let match;

  Logger.info(`Decorating gutters on: ${fileName}`);

  switch (pattern.name) {
    case SwitcherTypes.zones:
      pattern.getDecorations = getDecorationsForZones;
      break;

    case SwitcherTypes.tabs:
    default:
      pattern.getDecorations = getDecorationsForTabs;
      break;
  }

  regEx.lastIndex = 0;
  while ((match = regEx.exec(text))) {
    const { decorationOptions, decorationType, color } = pattern.getDecorations(
      activeTextEditor,
      match,
    );
    areas.push({ decorationOptions, decorationType, color });
  }
  areas = extendAreaToCoverEntireRange(areas);
  applyGutters(areas);
}

/**
 * @description Find the start and end positions where we match the regEx for the zone area.
 * @param activeTextEditor
 * @param match The regEx to match
 * @returns
 */
function getDecorationsForZones(activeTextEditor: TextEditor, match: RegExpExecArray): Decoration {
  // TODO: implement decorations for zone pivots
  const { positionAt } = activeTextEditor.document;
  const startPos = positionAt(match.index);
  const endPos = positionAt(match.index + match[0].length);

  const hoverMessage = match.length > 1 ? match[1] : match[0];

  // Create the deco options using the range.
  const decorationOptions: DecorationOptions = {
    range: new Range(startPos, endPos),
    hoverMessage: hoverMessage,
  };

  const color = getColor();

  // Set the color for the gutterIcon to rotate through our color constants.
  const decorationType = window.createTextEditorDecorationType({
    gutterIconPath: createIcon(color, GutterSVGs.startIcon),
    gutterIconSize: 'auto',
  });

  const decoration: Decoration = {
    decorationOptions,
    decorationType,
    color,
  };
  return decoration;
}

/**
 * @description Find the start and end positions where we match the regEx for the tab area.
 * @param activeTextEditor
 * @param match The regEx to match
 * @returns
 */
function getDecorationsForTabs(activeTextEditor: TextEditor, match: RegExpExecArray): Decoration {
  const { positionAt } = activeTextEditor.document;
  const startPos = positionAt(match.index);
  const endPos = positionAt(match.index + match[0].length - 1);

  const hoverMessage = match.length > 1 ? match[1] : match[0];

  // Create the deco options using the range.
  const decorationOptions: DecorationOptions = {
    range: new Range(startPos, endPos),
    hoverMessage: hoverMessage,
  };

  const color = getColor();

  // Set the color for the gutterIcon to rotate through our color constants.
  const decorationType = window.createTextEditorDecorationType({
    gutterIconPath: createIcon(color, GutterSVGs.startIcon),
    gutterIconSize: 'auto',
  });

  return { decorationOptions, decorationType, color };
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
  let { activeTextEditor } = window;
  areas.forEach(area => {
    scopeDecorations.push(area.decorationType);
    activeTextEditor?.setDecorations(area.decorationType, [area.decorationOptions]);
  });
}

/**
 * @description Create the gutter icon.
 * @param color Icon color
 * @returns The Uri for the SVG icon
 */
function createIcon(color: string, gutterSVG: GutterSVGs): Uri {
  const height = getGutterIndicatorHeight();
  const width = getGutterIndicatorWidth();
  const offset = getGutterIndicatorOffset();
  const opacity = getGutterIndicatorOpacity();
  let svg = '';

  switch (gutterSVG) {
    case GutterSVGs.startIcon:
      svg =
        `<svg xmlns="http://www.w3.org/2000/svg">` +
        `<rect x="${offset + width}" y="0" width="${
          height - width
        }" height="${width}" style="fill: ${color}${opacity};"></rect>;` +
        `<rect x="${offset}" y="0" width="${width}" height="${height}" style="fill: ${color}${opacity};"></rect>;` +
        `</svg>`;
      break;

    case GutterSVGs.defaultIcon:
      svg =
        `<svg xmlns="http://www.w3.org/2000/svg">` +
        `<rect x="${offset}" y="0" width="${width}" height="${height}" style="fill: ${color}${opacity};"></rect>;` +
        `</svg>`;
      break;
  }

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
  areas.forEach(area => {
    const { line } = area.decorationOptions.range.start;

    if (previousArea) {
      const { line: startLine } = previousArea.decorationOptions.range.start;

      // Create the deco options using the range.
      const decorationOptions = {
        range: new Range(startLine + 1, 0, line - 1, 0),
        hoverMessage: previousArea.decorationOptions.hoverMessage,
      };

      // Set the color for the gutterIcon to rotate through our color constants.
      const { color } = previousArea;
      const decorationType = window.createTextEditorDecorationType({
        gutterIconPath: createIcon(color, GutterSVGs.defaultIcon),
        gutterIconSize: 'auto',
      });

      areas.push({ decorationOptions, decorationType, color });
    }

    previousArea = area;
  });
  return areas;
}
