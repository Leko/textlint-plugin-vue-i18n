import {
  ASTNodeTypes,
  TextNodeRange,
  TxtNodeLineLocation,
  TxtParentNode,
} from '@textlint/ast-node-types'
import parseJson, { LiteralNode, PropertyNode, ValueNode } from 'json-to-ast'
import { rangeToLineColumn } from './location'

export function pickLocales(
  jsonStr: string,
  locales: Set<string> | null
): PropertyNode[] {
  const json = parseJson(jsonStr)
  if (json.type !== 'Object') {
    throw new Error('JSON must be an object')
  }
  return json.children.filter((c) => locales?.has(c.key.value) ?? true)
}

export function getStringNodes(node: ValueNode): LiteralNode[] {
  if (node.type === 'Object') {
    return node.children.flatMap((c) => getStringNodes(c.value))
  }
  if (node.type === 'Array') {
    return node.children.flatMap(getStringNodes)
  }
  if (typeof node.value === 'string') {
    return [node]
  }
  return []
}

export function fromLiteralNode(
  node: LiteralNode,
  text: string,
  offset: number = 0
): TxtParentNode {
  const range: TextNodeRange = [
    offset + node.loc!.start.offset,
    offset + node.loc!.end.offset,
  ]
  const loc: TxtNodeLineLocation = rangeToLineColumn(text, range)
  return {
    type: ASTNodeTypes.Paragraph,
    raw: node.raw,
    range,
    loc,
    children: [
      {
        type: ASTNodeTypes.Str,
        raw: node.raw,
        value: node.value,
        range,
        loc,
      },
    ],
  }
}
