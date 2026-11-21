`itemLocationCode` is the last character of the data module code (DMC). It states where the item that the information is about is located.

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `A` | Information about items installed on the Product |
| `B` | Information about items on a major assembly that was removed from the Product |
| `C` | Information about items on the bench |
| `D` | Information that applies to all three of `A`, `B` and `C` |
| `T` | Information about training |

## Related rules

- A BREX data module and a business rules document data module have `itemLocationCode` `D` (BREX-S1-00268 and BREX-S1-00265 of the default BREX).

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/list_data_modules}} and {{tool:reader/read_data_module}}. The value is returned as a part of the data module code |
| Decide it when a data module is created | `allocation.rules.itemLocationCode` of {{tool:writer/build_data_module}} |
