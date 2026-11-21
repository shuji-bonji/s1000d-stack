`updateHighlight` is the attribute that states whether a reason for update (`reasonForUpdate`) appears in the highlights data module. It is optional.

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `1` | The reason for update appears in the highlights data module |
| `0` | The reason for update does not appear in the highlights data module |

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/read_data_module}}. `updateHighlight` is in `identAndStatus.reasonForUpdates[]` |
| Write it together with a reason for update | `reason.updateHighlight` of {{tool:writer/add_reason_for_update}} and {{tool:writer/start_revision}}, and `marking.reason.updateHighlight` of {{tool:writer/edit_data_module}} |

No tool chooses the value. The value to pass is `"0"` or `"1"`, and it can be omitted.
