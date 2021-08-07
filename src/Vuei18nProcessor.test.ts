import fsPromises from 'fs/promises'
import path from 'path'
import { isTxtAST, test as validateTextlintASTNode } from '@textlint/ast-tester'
import { TextlintKernel, TextlintPluginOptions } from '@textlint/kernel'
import plugin from './index'
import {
  TextNodeRange,
  TxtNode,
  TxtNodeLineLocation,
} from '@textlint/ast-node-types'

async function lintFile(
  filePath: string,
  options: boolean | TextlintPluginOptions | undefined = true
) {
  const text = await fsPromises.readFile(filePath, 'utf-8')
  return lintText(text, options, filePath)
}

function lintText(
  text: string,
  options: boolean | TextlintPluginOptions | undefined = true,
  filePath?: string
) {
  const kernel = new TextlintKernel()
  return kernel.lintText(text, {
    filePath,
    ext: '.vue',
    plugins: [
      {
        pluginId: 'vue-i18n',
        plugin,
        options,
      },
    ],
    rules: [
      { ruleId: 'no-todo', rule: require('textlint-rule-no-todo').default },
    ],
  })
}

function parseText(
  text: string,
  filePath?: string,
  options: TextlintPluginOptions = {}
) {
  const processor = new plugin.Processor(options)
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

describe('Vuei18nProcessor', () => {
  it('parses JSON in the i18n block', async () => {
    const filePath = path.join(__dirname, '..', 'fixtures', 'test.vue')
    const text = await fsPromises.readFile(filePath, 'utf-8')
    const node = await parseText(text, filePath)
    validateTextlintASTNode(node)
    validateLocation(text, node)
    expect(isTxtAST(node)).toEqual(true)
    expect(node['children'].length).toEqual(4)
    expect(node['children'][0].children[0].value).toEqual('Hello')
    expect(node['children'][1].children[0].value).toEqual('TODO: this is TODO')
    expect(node['children'][2].children[0].value).toEqual('こんにちは')
    expect(node['children'][3].children[0].value).toEqual(
      'TODO: これはTODOです'
    )
  })
  it('parses specific locale in the JSON in the i18n block', async () => {
    const filePath = path.join(__dirname, '..', 'fixtures', 'test.vue')
    const text = await fsPromises.readFile(filePath, 'utf-8')
    const node = await parseText(text, filePath, { locales: ['ja'] })
    validateTextlintASTNode(node)
    validateLocation(text, node)
    expect(isTxtAST(node)).toEqual(true)
    expect(node['children'].length).toEqual(2)
    expect(node['children'][0].children[0].value).toEqual('こんにちは')
    expect(node['children'][1].children[0].value).toEqual(
      'TODO: これはTODOです'
    )
  })
  it('returns empty node if the file does not have i18n block', async () => {
    const filePath = path.join(__dirname, '..', 'fixtures', 'test-no-i18n.vue')
    const text = await fsPromises.readFile(filePath, 'utf-8')
    const node = await parseText(text, filePath)
    validateTextlintASTNode(node)
    validateLocation(text, node)
    expect(isTxtAST(node)).toEqual(true)
  })
  it('parses JSON file if the file matches a resources', async () => {
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
  it('does not parse JSON file if the file does not match a resources', async () => {
    const filePath = path.join(__dirname, '..', 'fixtures', 'test-ja.json')
    const text = await fsPromises.readFile(filePath, 'utf-8')
    const node = await parseText(text, filePath)
    validateTextlintASTNode(node)
    validateLocation(text, node)
    expect(isTxtAST(node)).toEqual(true)
    expect(node['children']).toEqual([])
  })

  it('reports nothing if the file does not have i18n block', async () => {
    const result = await lintFile(
      path.join(__dirname, '..', 'fixtures', 'test-no-i18n.vue')
    )
    expect(result.messages).toEqual([])
  })
  it('reports errors correctly', async () => {
    const result = await lintFile(
      path.join(__dirname, '..', 'fixtures', 'test.vue')
    )
    expect(result.messages).not.toEqual([])
    expect(result.messages).toMatchSnapshot()
  })
})
