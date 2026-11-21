`inWork` is the attribute that gives the in-work number of a data module. Together with {{attr:issueNumber}}, it identifies an issue.

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `00` | A released issue |
| `01` to `99` | An in-work issue. The first value is `01`, and it is raised each time the unreleased data module is changed |

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/list_data_modules}} and {{tool:reader/read_data_module}}. The value is in `issueInfo` |
| Start an in-work issue | {{tool:writer/start_revision}}. It sets `inWork` to `01` and writes a new file. The file of the released issue is not changed |
| Protect a released issue | {{tool:writer/edit_data_module}} edits an issue whose `inWork` is `00` only when `allowReleasedIssue: true` is passed. An edit with `marking` is refused even with this value |

This stack does not yet have an operation that releases an issue (setting `inWork` back to `00` and raising `issueNumber`).
