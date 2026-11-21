`reasonForUpdateRefIds` is the attribute that points from an element with change markup to the `id` of the `reasonForUpdate` that gives the reason for the change. It is written together with {{attr:changeType}} and {{attr:changeMark}}. It is optional. The type is `xs:IDREFS`, so several `id` values can be written, separated by spaces.

## Related rules

- Changes made for the same reason point to the same `reasonForUpdate` (Chap 3.9.5.2.1.1, Para 2.1.3).
- No change markup points to the `reasonForUpdate` of an editorial change ({{attr:updateReasonType}} is `urt01`) (Chap 3.9.5.2.1.1, Para 2.2).

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/read_data_module}}. The value is in `change.reasonForUpdateRefIds` of nodes and references |
| Add a new reason and point to it | `marking.reason` of {{tool:writer/edit_data_module}} |
| Point to an existing reason | `marking.reasonRefId` of {{tool:writer/edit_data_module}}. The value is `identAndStatus.reasonForUpdates[].id` |

`marking` takes either `reason` or `reasonRefId`, not both. Use `reason` for the first edit made for a reason, and `reasonRefId` for the later edits.
