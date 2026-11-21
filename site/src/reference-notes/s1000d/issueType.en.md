`issueType` is the attribute that states what kind of issue an issue of a CSDB object, such as a data module, is. There are eight values.

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `new` | An issue up to and including the first release. `issueNumber` is `000` for in-work issues and `001` for the first release |
| `changed` | An issue that has changes and shows them with change markup |
| `revised` | An issue that is totally revised and has no change markup |
| `status` | An issue in which the identification and status information was updated |
| `deleted` | A deleted issue. The data module is not physically removed from the CSDB; this value marks it as deleted |
| `rinstate-changed` | An issue that reinstates a deleted data module and shows the changes with change markup |
| `rinstate-revised` | An issue that reinstates a deleted data module and does not show the changes with change markup |
| `rinstate-status` | An issue that reinstates a deleted data module, in which only the status information changed |

## Choosing a value

The following table is a guide. If the business rules of the project say which value to use, follow them.

| Situation | Value |
| --- | --- |
| The data module is new and has never been released | `new` |
| A step is added to a released issue, and the added part is shown with change markup | `changed` |
| The whole data module was rewritten. No change markup is added | `revised` |
| Only the security classification or the quality assurance status was changed. The content was not changed | `status` |

## Related rules

- The rules for each value are in the default BREX: BREX-S1-00030 (`new`), BREX-S1-00031 (`deleted`), BREX-S1-00032 (`changed`, `rinstate-changed`), BREX-S1-00033 (`revised`, `rinstate-revised`) and BREX-S1-00034 (`status`, `rinstate-status`).
- An issue whose `issueType` is not `changed` needs at least one `reasonForUpdate` if its `issueNumber` is greater than `001` (BREX-S1-00038 of the default BREX).
- Table 3 of Chap 3.9.5.1 of the specification gives `new` as the `issueType` of the in-work issue that follows `001-00` (`001-01`). BREX-S1-00030 of the default BREX makes this combination a violation. The two do not agree.

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/read_data_module}}. The value is in the identification and status section (`identAndStatus`) |
| Decide it when an in-work issue is started | `issueType` of {{tool:writer/start_revision}}. It cannot be omitted. The user chooses from `changed`, `revised` and `status` |
| Reconcile with a DML | {{tool:verify/reconcile_dml}}. It returns the `issueType` of each DML entry as written |

No tool chooses the value of `issueType`. The tools do not interpret the meaning of the value either.
