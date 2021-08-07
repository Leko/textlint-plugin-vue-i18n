import fsPromises from 'fs/promises'
import path from 'path'
import { isTxtAST, test as validateTextlintASTNode } from '@textlint/ast-tester'
import { TextlintPluginOptions } from '@textlint/kernel'
import { JSONProcessor } from './JSONProcessor'
import {
  TextNodeRange,
  TxtNode,
  TxtNodeLineLocation,
} from '@textlint/ast-node-types'

function parseText(
  text: string,
  filePath?: string,
  options: TextlintPluginOptions = {}
) {
  const processor = new JSONProcessor(options)
  return processor.processor().preProcess(text, filePath)
}

function locToRange(text: string, loc: TxtNodeLineLocation): TextNodeRange {
  const lines = text.split('\n')
  return [
    (
      lines.slice(0, loc.start.line - 1).join('\n') +
      lines[loc.start.line - 1]?.slice(0, loc.start.column)
    ).length + (loc.start.line > 0 && loc.start.column > 0 ? 1 : 0),
    (
      lines.slice(0, loc.end.line - 1).join('\n') +
      lines[loc.end.line - 1]?.slice(0, loc.end.column)
    ).length + 1,
  ]
}

function validateLocation(text: string, node: TxtNode) {
  for (let n of node['children'] ?? []) {
    validateLocation(text, n)
  }
  if (node['raw']) {
    expect(text.slice(...node.range)).toEqual(node['raw'])

    const range = locToRange(text, node.loc)
    expect(text.slice(...range)).toEqual(node['raw'])
  }
}

describe('JSONProcessor', () => {
  it('parses JSON file correctly', async () => {
    const filePath = path.join(__dirname, '..', 'fixtures', 'test-ja.json')
    const text = await fsPromises.readFile(filePath, 'utf-8')
    const node = await parseText(text, filePath, {
      resources: [filePath],
    })
    validateTextlintASTNode(node)
    validateLocation(text, node)
    expect(isTxtAST(node)).toEqual(true)
    expect(node['children'].length).toEqual(1)
    expect(node['children'][0]['children'].length).toEqual(1)
    expect(node['children'][0]['children'][0].value).toEqual('朝')
  })
})
