import * as vscode from 'vscode';
import { SwitcherTypes } from './enums';
import { AreaPattern, AreaPatternTypes } from './interfaces';

export const patternTypes: AreaPatternTypes = {
  tabs: {
    /*
      A two part expression, separated by the OR (|) operator.

      == PART 1: ==== /# \[(.*)\] ====================
        Match all the tab definitions and captures
        the tab labels for display.
      ================================================
      #             a single pound sign and single space
      \[            open square bracket
      (.*)          unlimited series of non-line break characters in a capture group (the tab label)
      \]            close square bracket

      == PART 2: ==== | ==============================
        The OR operator
      ================================================

      |             OR operator

      == PART 3: ==== (?<=(# [.\S\s]*))---[\n\r] ====
        Match "---", but skip metadata delimiters by
        only matching when "---" is preceded by "#".
      ================================================
      (?<=          open up a look behind expression
      (# [.\S\s]*)  require that "#" plus any other text is present
      )             close the look behind expression
      ---           match on three dashes
      [\n\r]        match on line break (\n) and carriage return (\r) -> necessary to ensure the pattern does not match on table definitions

      flags:        global and case insensitive
    */
    regex: /# \[(.*)\]|(?<=(# [.\S\s]*))---[\n\r]/gi,
    name: SwitcherTypes.tabs,
  },
  zones: {
    regex: /:::zone.pivot="(.*)"[\S\s.]|:::zone-end/gi,
    name: SwitcherTypes.zones,
  },
};

export function getPattern(text: string) {
  const { tabs, zones } = patternTypes;
  let areaPattern: AreaPattern = tabs; // default

  if (tabs.regex.test(text)) {
    areaPattern = tabs;
  } else if (zones.regex.test(text)) {
    areaPattern = zones;
  }

  return areaPattern;
}
