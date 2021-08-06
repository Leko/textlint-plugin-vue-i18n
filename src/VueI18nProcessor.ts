import type {
  TextlintPluginProcessor,
  TextlintPluginOptions,
} from '@textlint/types'
import { ASTNodeTypes, TxtNode } from '@textlint/ast-node-types'
import { findI18nBlock, fromSFCBlock } from './vue-ast'
import { getStringNodes, fromLiteralNode, pickLocales } from './json-ast'

function getEmptyDoc(): TxtNode {
  return {
    type: ASTNodeTypes.Document,
    raw: '',
    range: [0, 0],
    loc: {
      start: { line: 1, column: 0 },
      end: { line: 1, column: 0 },
    },
    children: [],
  }
}

export class VueI18nProcessor implements TextlintPluginProcessor {
  config: TextlintPluginOptions
  locales: Set<string> | null

  constructor(config = {}) {
    this.config = config
    this.locales = this.config['locales']
      ? new Set(this.config['locales'])
      : null
  }

  availableExtensions() {
    return ['.vue']
  }

  processor(_ext: string) {
    const locales = this.locales
    return {
      preProcess(text: string, _filePath?: string): TxtNode {
        const i18nBlock = findI18nBlock(text)
        if (!i18nBlock) {
          return getEmptyDoc()
        }
        const rootNode = fromSFCBlock(text, i18nBlock)
        const matches = pickLocales(i18nBlock.content, locales)
        const children = matches
          .flatMap((m) => getStringNodes(m.value))
          .map((n) => fromLiteralNode(n, rootNode))

        return {
          ...rootNode,
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
