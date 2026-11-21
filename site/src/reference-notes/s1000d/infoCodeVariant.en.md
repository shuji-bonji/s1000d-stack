`infoCodeVariant` is a part of the data module code (DMC): the variant of the information code. The value is one alphanumeric character. It is written together with {{attr:infoCode}}. The rules are in Chap 4.3.7 of the specification.

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/list_data_modules}} and {{tool:reader/read_data_module}}. The value is returned as a part of the data module code |
| Decide it when a data module is created | `allocation.rules.infoCodeByKind` of {{tool:writer/build_data_module}}. Pass both `infoCode` and `infoCodeVariant` for each kind |
