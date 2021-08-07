import type {
  TextNodeRange,
  TxtNodeLineLocation,
  TxtNodePosition,
} from '@textlint/ast-node-types'

const DELIMITER = '\n'

export function rangeToLineColumn(
  text: string,
  range: TextNodeRange
): TxtNodeLineLocation {
  return {
    start: positionToLineColumn(text, range[0]),
    end: positionToLineColumn(text, range[1]),
  }
}

export function positionToLineColumn(
  text: string,
  position: number
): TxtNodePosition {
  const subStr = text.slice(0, position)
  const newLines = countOccurences(subStr, DELIMITER)
  return {
    line: newLines + 1,
    column: subStr.length - subStr.lastIndexOf('\n') - 1,
  }
}

function countOccurences(haystack: string, needle: string): number {
  let count = 0
  let cursor = haystack.indexOf(needle)
  while (cursor !== -1) {
    count++
    cursor = haystack.indexOf(needle, cursor + 1)
  }
  return count
}
