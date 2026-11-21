`internalRefTargetType` is the attribute that states what type of target an `internalRef` (a reference inside the same data module) points to. It is optional.

## Meaning of the values

| Value | Target |
| --- | --- |
| `irtt01` | Illustration |
| `irtt02` | Table |
| `irtt03` | Multimedia |
| `irtt04` | Supply |
| `irtt05` | Support equipment |
| `irtt06` | Spare |
| `irtt07` | Paragraph |
| `irtt08` | Step |
| `irtt09` | Graphic |
| `irtt10` | Multimedia object |
| `irtt11` | Hotspot |
| `irtt12` | Parameter |
| `irtt13` | Zone |
| `irtt14` | Work location |
| `irtt15` | Service bulletin material set |
| `irtt16` | Access point |
| `irtt51` to `irtt99` | Values whose meaning the project defines |

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/read_data_module}}. The value is in the reference of the `internalRef`, as written |
| Check that the target exists | {{tool:verify/check_references}}. It checks that the `id` an `internalRef` points to is in the same data module |
| Check whether a value is allowed | {{tool:brex/lookup_value}} |
