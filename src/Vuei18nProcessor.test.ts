import fsPromises from 'fs/promises'
import path from 'path'
import { isTxtAST, test as validateTextlintASTNode } from '@textlint/ast-tester'
import { TextlintKernel, TextlintPluginOptions } from '@textlint/kernel'
import plugin from './index'

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

async function parseFile(
  filePath: string,
  options: TextlintPluginOptions = {}
) {
  const text = await fsPromises.readFile(filePath, 'utf-8')
  return parseText(text, filePath, options)
}

function parseText(
  text: string,
  filePath?: string,
  options: TextlintPluginOptions = {}
) {
  const processor = new plugin.Processor(options)
  return processor.processor('.vue').preProcess(text, filePath)
}

describe('Vuei18nProcessor', () => {
  it('parses JSON in the i18n block', async () => {
    const node = await parseFile(
      path.join(__dirname, '..', 'fixtures', 'test.vue')
    )
    validateTextlintASTNode(node)
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
    const node = await parseFile(
      path.join(__dirname, '..', 'fixtures', 'test.vue'),
      { locales: ['ja'] }
    )
    validateTextlintASTNode(node)
    expect(isTxtAST(node)).toEqual(true)
    expect(node['children'].length).toEqual(2)
    expect(node['children'][0].children[0].value).toEqual('こんにちは')
    expect(node['children'][1].children[0].value).toEqual(
      'TODO: これはTODOです'
    )
  })
  it('returns empty node if the file does not have i18n block', async () => {
    const node = await parseFile(
      path.join(__dirname, '..', 'fixtures', 'test-no-i18n.vue')
    )
    validateTextlintASTNode(node)
    expect(isTxtAST(node)).toEqual(true)
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
