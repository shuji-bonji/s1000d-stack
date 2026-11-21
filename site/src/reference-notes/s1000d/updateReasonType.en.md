`updateReasonType` is the attribute that states what type of change a reason for update (`reasonForUpdate`) describes when a data module is revised. It is optional. `reasonForUpdate` is written inside `dmStatus`, `pmStatus`, `imfStatus`, `scormContentPackageStatus`, `targetDmStatus`, and `frontMatterDmEntry`, `frontMatterPmEntry` and `frontMatterExternalPubEntry` of `frontmatter.xsd`.

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `urt01` | An editorial change. It contains no technical change. No change markup is linked to this reason |
| `urt02` | A technical change. Unless the `issueType` of the issue is `revised`, change markup linked to this reason is needed |
| `urt03` | A change to the markup only. If it affects the technical content and the `issueType` of the issue is `changed`, the change is marked |
| `urt04` | A change to the applicability markup only. If it does not affect the technical content, or the `issueType` is not `changed`, no change markup is added |
| `urt05` | A change to the reference markup only. Change markup is handled in the same way as for `urt04` |
| `urt51` to `urt99` | Values whose meaning the project defines |

## Choosing a value

The following table is a guide. If the business rules of the project say which value to use, follow them.

| Situation | Value |
| --- | --- |
| A typo was corrected. The meaning of the step does not change | `urt01` |
| A step was added. A torque value was changed | `urt02` |
| Only the nesting of elements or the attributes were corrected. The displayed text does not change | `urt03` |
| An applicable model was added. The content of the steps does not change | `urt04` |
| Only a reference target was corrected. The content of the steps does not change | `urt05` |

## Related rules

- A `reasonForUpdate` without `updateReasonType` is treated as a technical change (Chap 3.9.5.2.1.1, Para 2.2).
- Changes made for the same reason point to the same `reasonForUpdate` (Chap 3.9.5.2.1.1, Para 2.1.3).
- An issue whose `issueType` is not `changed` needs at least one `reasonForUpdate` if its `issueNumber` is greater than `001` (BREX-S1-00038 of the default BREX).
- {{attr:updateHighlight}} states whether the reason appears in the highlights data module.

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/read_data_module}}. `updateReasonType` is in `identAndStatus.reasonForUpdates[]` |
| Add only a reason for update | {{tool:writer/add_reason_for_update}} |
| Add a reason when an in-work issue is started | `reason` of {{tool:writer/start_revision}} |
| Add a reason together with change markup | `marking.reason` of {{tool:writer/edit_data_module}} |
| Check whether a value is allowed | {{tool:brex/lookup_value}} (`updateReasonType` in `target`, the value to check in `value`) |

No tool chooses the value of `updateReasonType`. Each tool takes the value the user has decided. The tools do not interpret the meaning of the value either.
