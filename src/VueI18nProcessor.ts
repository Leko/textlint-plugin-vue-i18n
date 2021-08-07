import type {
  TextlintPluginProcessor,
  TextlintPluginOptions,
} from '@textlint/types'
import { ASTNodeTypes, TxtNode } from '@textlint/ast-node-types'
import * as micromatch from 'micromatch'
import { findI18nBlock, fromSFCBlock, rangeToLineLocation } from './vue-ast'
import { getStringNodes, fromLiteralNode, pickLocales } from './json-ast'
import { PropertyNode } from 'json-to-ast'

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
  resources: string[]

  constructor(config = {}) {
    this.config = config
    this.locales = this.config['locales']
      ? new Set(this.config['locales'])
      : null
    this.resources = this.config['resources'] ?? []
  }

  availableExtensions() {
    return ['.vue', '.json']
  }

  processor() {
    const locales = this.locales
    const resources = this.resources
    return {
      preProcess(text: string, filePath?: string): TxtNode {
        let rootNode: TxtNode, matches: PropertyNode[]
        if (filePath && micromatch.isMatch(filePath, resources)) {
          rootNode = {
            type: ASTNodeTypes.Document,
            raw: text,
            range: [0, text.length],
            loc: rangeToLineLocation(text, [0, text.length]),
          }
          matches = pickLocales(rootNode.raw, null)
        } else {
          const i18nBlock = findI18nBlock(text)
          if (!i18nBlock) {
            return getEmptyDoc()
          }
          rootNode = fromSFCBlock(text, i18nBlock)
          matches = pickLocales(rootNode.raw, locales)
        }

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
