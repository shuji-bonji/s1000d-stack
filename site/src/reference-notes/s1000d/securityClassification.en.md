`securityClassification` is the attribute that gives the security classification. The security classification of a whole data module is written on the `security` element of the identification and status section. Elements of the content can carry it too.

## Meaning of the values

The project defines the meaning of the values. The default BREX allows `01` to `09` and the range `51~99`, but it does not give their meaning. The data dictionary does not give it either. Check the business rules of the project to find which value stands for which classification.

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/read_data_module}}. The value is in the identification and status section (`identAndStatus`) |
| Write it when a data module is created | `draft.securityClassification` of {{tool:writer/build_data_module}}. It cannot be omitted. The tool does not fill in a value; it writes the value as given |
| Look up the values and their meaning | {{tool:brex/lookup_value}}. If the project BREX gives the meaning of a value, the tool returns it |

For a value whose meaning the project BREX does not give either, no tool can return a meaning.
