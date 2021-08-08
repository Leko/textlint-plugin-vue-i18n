import type {
  TextlintPluginProcessor,
  TextlintPluginOptions,
} from '@textlint/types'
import { ASTNodeTypes, TextNodeRange, TxtNode } from '@textlint/ast-node-types'
import * as micromatch from 'micromatch'
import { PropertyNode } from 'json-to-ast'
import { findI18nBlock } from './vue-ast'
import { getStringNodes, fromLiteralNode, pickLocales } from './json-ast'
import { JSONProcessor } from './JSONProcessor'
import { rangeToLineColumn } from './location'

function getEmptyDoc(): TxtNode {
  const range: TextNodeRange = [0, 0]
  return {
    type: ASTNodeTypes.Document,
    raw: '',
    range,
    loc: rangeToLineColumn('', range),
    children: [],
  }
}

export class VueI18nProcessor implements TextlintPluginProcessor {
  readonly config: TextlintPluginOptions
  readonly locales: Set<string> | null
  readonly resources: string[]
  readonly jsonProcessor: JSONProcessor

  constructor(config = {}) {
    this.config = config
    this.locales = this.config['locales']
      ? new Set(this.config['locales'])
      : null
    this.resources = this.config['resources'] ?? []
    this.jsonProcessor = new JSONProcessor(config)
  }

  availableExtensions() {
    return ['.vue'].concat(this.jsonProcessor.availableExtensions())
  }

  processor() {
    const locales = this.locales
    const resources = this.resources
    const jsonProcessor = this.jsonProcessor
    return {
      preProcess(text: string, filePath?: string): TxtNode {
        if (filePath && micromatch.isMatch(filePath, resources)) {
          return jsonProcessor.processor().preProcess(text, filePath)
        }
        const i18nBlock = findI18nBlock(text)
        if (!i18nBlock) {
          return getEmptyDoc()
        }
        const matches: PropertyNode[] = pickLocales(i18nBlock.content, locales)
        const children = matches
          .flatMap((m) => getStringNodes(m.value))
          .map((n) => fromLiteralNode(n, text, i18nBlock.start!))
        const range: [number, number] = [0, text.length]

        return {
          type: ASTNodeTypes.Document,
          raw: text,
          range,
          loc: rangeToLineColumn(text, range),
          children,
        }
      },
      postProcess(
        messages: Array<any>,
        filePath?: string
      ): { messages: Array<any>; filePath: string } {
        return {
          messages,
          filePath: filePath ? filePath : '<text>',
        }
      },
    }
  }
}
