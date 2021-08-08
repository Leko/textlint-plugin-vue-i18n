import type {
  TextlintPluginProcessor,
  TextlintPluginOptions,
} from '@textlint/types'
import { ASTNodeTypes, TxtNode, TextNodeRange } from '@textlint/ast-node-types'
import { PropertyNode } from 'json-to-ast'
import { getStringNodes, fromLiteralNode, pickLocales } from './json-ast'
import { rangeToLineColumn } from './location'

export class JSONProcessor implements TextlintPluginProcessor {
  readonly config: TextlintPluginOptions

  constructor(config = {}) {
    this.config = config
  }

  availableExtensions() {
    return ['.json']
  }

  processor() {
    return {
      preProcess(text: string, _filePath?: string): TxtNode {
        const range: TextNodeRange = [0, text.length]
        const matches: PropertyNode[] = pickLocales(text, null)
        const children = matches
          .flatMap((m) => getStringNodes(m.value))
          .map((n) => fromLiteralNode(n, text))

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
