import type { SFCBlock } from 'vue-template-compiler'
import { parseComponent } from 'vue-template-compiler'

export function findI18nBlock(text: string): SFCBlock | null {
  const { customBlocks } = parseComponent(text)
  return customBlocks.find((c) => c.type === 'i18n') ?? null
}
