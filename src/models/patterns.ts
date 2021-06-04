import * as vscode from 'vscode';
import { SwitcherTypes } from './enums';
import { AreaPattern, AreaPatternTypes } from './interfaces';

export const patternTypes: AreaPatternTypes = {
  tabs: {
    regex: /# \[(.*)\]|(?<=(# [.\S\s]*))---[\n\r]/gi,
    // regex: /# \[(.*)\]|(?<=#)---[\n\r]/gi,
    name: SwitcherTypes.tabs,
  },
  zones: {
    regex: /:::zone.pivot="(.*)"[\S\s.]|:::zone-end/gi,
    name: SwitcherTypes.zones,
  },
};

export function getPattern(text: string, patternTypes: AreaPatternTypes) {
  const { tabs, zones } = patternTypes;
  let areaPattern: AreaPattern = tabs; // default

  if (tabs.regex.test(text)) {
    areaPattern = tabs;
  } else if (zones.regex.test(text)) {
    areaPattern = zones;
  }

  return areaPattern;
}
