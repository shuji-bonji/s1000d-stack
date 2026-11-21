`changeType` is the attribute that states the type of a change in the change markup of an element. It is written together with {{attr:changeMark}} and {{attr:reasonForUpdateRefIds}}. It is optional.

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `add` | The element was added |
| `modify` | The element was changed |
| `delete` | The element was removed |

## Related rules

- An element that has `changeMark` but no `changeType` is treated as an added element (Chap 3.9.5.2.1.1, Para 2.4.1).
- The children of an element marked `add` or `delete` need no change markup. Markup on the children is ignored when the data module is displayed.
- An element marked `modify` can contain elements marked `add`, `modify` or `delete`.
- An issue whose `issueType` is not `changed` cannot contain change markup (BREX-S1-00036 of the default BREX. The XPath of the rule excludes issues of type `changed`, `status`, `rinstate-changed` and `rinstate-status`).

## In this stack

| Operation | Tool |
| --- | --- |
| Read | {{tool:reader/read_data_module}}. The value is in `change` of nodes and references, and in `changeMarks[]`, the list for the whole data module |
| Add it in an edit | `marking` of {{tool:writer/edit_data_module}}. An added element gets `add` and an element to remove gets `delete`. When an element is moved inside the same parent, the parent element gets `modify` |
| Remove it when the next issue is started | {{tool:writer/start_revision}}. It removes the change markup of the previous issue and takes out the elements marked `delete` |

Taking out the elements marked `delete` in the next issue is not stated in the parts of the specification that were read. It is this stack's interpretation.
