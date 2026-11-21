`changeMark` is the attribute that states whether a visual indication, such as a change bar, is displayed next to a changed element. It is written together with {{attr:changeType}} and {{attr:reasonForUpdateRefIds}}. It is optional.

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `1` | The indication is displayed |
| `0` | The indication is not displayed |

## Related rules

- Editorial changes have no change markup (BREX-S1-00044 of the default BREX; Chap 3.9.5.2.1.1, Para 2.1.1).
- An element that has `changeMark` but no `changeType` is treated as an added element (Chap 3.9.5.2.1.1, Para 2.4.1).

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/read_data_module}}. The value is in `change.changeMark` of nodes and references |
| Add it in an edit | `marking.changeMark` of {{tool:writer/edit_data_module}}. It cannot be omitted when `marking` is passed |

The tool does not choose the value of `changeMark`. It takes the value the user has decided.
