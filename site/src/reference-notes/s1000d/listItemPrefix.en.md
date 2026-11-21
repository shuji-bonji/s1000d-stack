`listItemPrefix` is the attribute that gives the symbol placed before the items of an unordered list (such as `randomList`). It is optional.

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `pf01` | No symbol; only an indent |
| `pf02` | A symbol that depends on the level of the list |
| `pf03` | A short dash |
| `pf04` | A dot inside a circle |
| `pf05` | An outline circle |
| `pf06` | An outline square |
| `pf07` | A bullet |
| `pf51` to `pf99` | Values whose meaning the project defines |

## Related rules

- A `reducedRandomList` in a front matter title page has `listItemPrefix` set to `pf03` and uses no other attribute (BREX-S1-00117 of the default BREX).

## In this stack

| Operation | Tool |
| --- | --- |
| Create | The lists that {{tool:writer/build_data_module}} creates do not carry this attribute |
| Check whether a value is allowed | {{tool:brex/lookup_value}} |
