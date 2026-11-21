`infoCode` is a part of the data module code (DMC): the information code that states what type of information a data module holds. The value is three alphanumeric characters. It is written together with {{attr:infoCodeVariant}}.

## Meaning of the values

The list of information codes is in Chap 8.4.1 of the specification. The default BREX defines 593 values for the `infoCode` of a data module and 13 values for the `infoCode` of a data update file. This page lists only the values that appear in other rules.

| Value | Meaning |
| --- | --- |
| `022` | BREX data module |
| `024` | Business rules document |
| `040` | Description |

## Related rules

- A BREX data module has `infoCode` `022` and {{attr:itemLocationCode}} `D` (BREX-S1-00268 of the default BREX).
- A business rules document data module has `infoCode` `024` and `itemLocationCode` `D` (BREX-S1-00265).

## In this stack

| Operation | Tool |
| --- | --- |
| Look up the meaning of a value | {{tool:brex/lookup_value}} (`infoCode` in `target`, the value to check in `value`) |
| Filter by information code | `filter.infoCode` of {{tool:reader/list_data_modules}} |
| Decide it when a data module is created | `allocation.rules.infoCodeByKind` of {{tool:writer/build_data_module}}. There is no default value. If it is omitted, the tool returns `input-error` |

The project decides which information code to use. The tools do not choose an information code.
