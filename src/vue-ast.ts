import { ASTNodeTypes, TxtNode } from '@textlint/ast-node-types'
import type { SFCBlock } from 'vue-template-compiler'
import { parseComponent } from 'vue-template-compiler'
import { rangeToLineColumn } from './location'

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
    loc: rangeToLineColumn(text, range),
  }
}
