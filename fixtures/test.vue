
<i18n>
{
  "en": {
    "deep": {
      "nested": {
        "greeting": "Hello"
      }
    },
    "todo": "TODO: this is TODO"
  },
  "ja": {
    "deep": {
      "nested": {
        "greeting": "こんにちは"
      }
    },
    "todo": "TODO: これはTODOです"
  }
}
</i18n>

<template>
  <span>{{ $t('deep.nested.greeting') }}</span>
</template>
