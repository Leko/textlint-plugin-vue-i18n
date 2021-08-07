# textlint-plugin-vue-i18n

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
      "locales": ["ja"]
    }
  }
}
```

### Options

- `locales` (`string[]`): List of locales. If you specify it, this plugin will retrieve texts only in the locales. Default: `null` (retrieve all locales)

## License

MIT
