import {
  ASTNodeTypes,
  TextNodeRange,
  TxtNode,
  TxtNodeLineLocation,
  TxtNodePosition,
  TxtParentNode,
} from '@textlint/ast-node-types'
import type {
  LiteralNode,
  Position,
  PropertyNode,
  ValueNode,
} from 'json-to-ast'
import parseJson from 'json-to-ast'

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
  parent: TxtNode
): TxtParentNode {
  const range: TextNodeRange = [
    parent.range[0] + node.loc!.start.offset,
    parent.range[0] + node.loc!.end.offset,
  ]
  const loc: TxtNodeLineLocation = {
    start: offset(node.loc!.start, parent.loc.start),
    end: offset(node.loc!.end, parent.loc.start),
  }
  return {
    type: ASTNodeTypes.Paragraph,
    raw: node.raw,
    range,
    loc,
    // parent,
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

function offset(
  position: Position,
  location: TxtNodePosition
): TxtNodePosition {
  if (position.line === location.line) {
    return {
      line: position.line,
      column: position.column - 1 + location.column,
    }
  }
  return {
    line: position.line + location.line - 1,
    column: position.column - 1,
  }
}
