`issueNumber` is the attribute that gives the issue number of a data module or a data management list. Together with {{attr:inWork}}, it identifies an issue.

## Related rules

- Up to the first release, in-work issues are `000` and the first release is `001` (BREX-S1-00030 of the default BREX).
- A value below 1,000 is written with three digits (BREX-S1-00274). A value from 1,000 to 9,999 is written with four digits (BREX-S1-00275).
- In a file name, the issue number and the in-work number are written like `_002-01`.

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/list_data_modules}} and {{tool:reader/read_data_module}}. The value is in `issueInfo` |
| Decide it when a data module is created | {{tool:writer/build_data_module}}. Pass `issueInfo` in the draft, or let `issuePolicy` (`increment-issue`, `increment-inwork`, `keep`) decide |
| Start an in-work issue | {{tool:writer/start_revision}}. It does not change `issueNumber` |

This stack does not yet have an operation that releases an issue (setting `inWork` back to `00` and raising `issueNumber`).
