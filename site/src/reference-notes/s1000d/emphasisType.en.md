`emphasisType` is the attribute that gives the type of an emphasis (`emphasis`) inside text. It is optional.

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `em01` | Bold |
| `em02` | Italic. A value for legacy data |
| `em03` | Underline. A value for legacy data |
| `em04` | Overline. Used only to mark vectors |
| `em05` | Strikethrough. Not used to show deleted text |
| `em51` to `em99` | Values whose meaning the project defines |

## In this stack

| Operation | Tool |
| --- | --- |
| Create | The draft of {{tool:writer/build_data_module}} has no way to write an emphasis |
| Translate | {{tool:writer/extract_segments}} takes out text with each `emphasis` replaced by a placeholder such as `{1}` or `{2}`. {{tool:writer/apply_segments}} puts the original elements back into the translated text |
| Check whether a value is allowed | {{tool:brex/lookup_value}} |
