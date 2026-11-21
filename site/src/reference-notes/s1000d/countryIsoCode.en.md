`countryIsoCode` is the attribute that gives the country where the language is spoken. The value is a two-letter ISO 3166 code, written in upper case. It is written on the `language` element together with {{attr:languageIsoCode}}.

## Related rules

- At the end of a file name, the language and the country are written in upper case, like `_JA-JP`.

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/list_data_modules}} and {{tool:reader/read_data_module}}. The value is in `language` |
| Write it when a data module is created | `draft.language` of {{tool:writer/build_data_module}} |
| Create a translated issue | `language` of {{tool:writer/apply_segments}} |
