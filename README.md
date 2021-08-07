# textlint-plugin-vue-i18n

![npm version](https://img.shields.io/npm/v/textlint-plugin-vue-i18n)
![license](https://img.shields.io/github/license/Leko/textlint-plugin-vue-i18n)

A [textlint](https://github.com/textlint/textlint) plugin to extract texts from [vue-i18n](https://github.com/kazupon/vue-i18n) custom blocks.

## Install

```
npm i -D textlint-plugin-vue-i18n
```

## Configuration

Add this plugin into the plugins field in the `.textlintrc`.

```json
{
  "plugins": {
    "textlint-plugin-vue-i18n": {
      "locales": ["ja"],
      "resources": ["./locales/*.json"]
    }
  }
}
```

### Options

- `locales` (optional, `string[]`): List of locales. If you specify it, this plugin will retrieve texts only in the locales. Default: `null` (retrieve all locales)
- `resources` (optional, `string[]`): List of [glob](https://github.com/isaacs/node-glob) patterns. If you specify it, this plugin will retrieve texts not only the i18n blocks but also specified JSON files. Default: `[]` (doesn't retrieve a resource)

## License

MIT
