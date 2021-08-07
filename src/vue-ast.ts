import {
  ASTNodeTypes,
  TxtNode,
  TxtNodeLineLocation,
  TxtNodePosition,
} from '@textlint/ast-node-types'
import type { SFCBlock } from 'vue-template-compiler'
import { parseComponent } from 'vue-template-compiler'

export function findI18nBlock(text: string): SFCBlock | null {
  const { customBlocks } = parseComponent(text)
  return customBlocks.find((c) => c.type === 'i18n') ?? null
}

export function fromSFCBlock(
  text: string,
  block: Pick<SFCBlock, 'start' | 'end' | 'content'>
): TxtNode {
  const range: [number, number] = [block.start!, block.end!]
  return {
    type: ASTNodeTypes.Document,
    raw: block.content,
    range,
    loc: rangeToLineLocation(text, range),
  }
}

export function rangeToLineLocation(
  text: string,
  range: [number, number]
): TxtNodeLineLocation {
  return {
    start: positionToLineColumn(text, range[0]),
    end: positionToLineColumn(text, range[1]),
  }
}

function positionToLineColumn(text: string, position: number): TxtNodePosition {
  const sub = text.substr(0, position)
  let line = 1
  let cursor = 0
  while (1) {
    const index = sub.indexOf('\n', cursor)
    if (index === -1) {
      break
    }
    cursor = index + 1
    line++
  }
  return {
    line,
    column: sub.length - sub.lastIndexOf('\n') - 1,
  }
}
