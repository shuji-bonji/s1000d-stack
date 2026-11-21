`languageIsoCode` is the attribute that gives the language of a data module. It is written on the `language` element together with {{attr:countryIsoCode}}.

## Meaning of the values

The value is an ISO 639 language code. A simplified language uses a separate code that does not clash with the ISO 639 codes.

| Example value | Meaning |
| --- | --- |
| `en`, `ja` | ISO 639 codes (English, Japanese) |
| `sx` | A data module written in ASD-STE100 (Simplified Technical English) |

## Related rules

- At the end of a file name, the language and the country are written in upper case, like `_JA-JP`.
- A translated data module has the same data module code; only the language and the country differ.

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/list_data_modules}} and {{tool:reader/read_data_module}}. The value is in `language` |
| Write it when a data module is created | `draft.language` of {{tool:writer/build_data_module}} |
| Create a translated issue | `language` of {{tool:writer/apply_segments}}. The data module code stays the same and only the language changes |
