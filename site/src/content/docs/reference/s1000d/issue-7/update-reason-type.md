---
title: updateReasonType
description: The values allowed for the S1000D Issue 7 attribute updateReasonType (the type of a reason for update), how to choose a value, the related rules, and how the S1000D Stack tools handle it.
---

:::note[About this page]
This page is an unofficial guide to S1000D® Issue 7, written in this project's own words. It is based on the S1000D distribution dated 2026-07-16. This is a personal project and is not affiliated with ASD ([Specification files and trademarks](/s1000d-stack/guide/license/)). The formal definition is in Chap 3.9.6.1 (Table 82) of the S1000D specification and in the [S1000D Issue 7 data dictionary](https://users.s1000d.org/S1000D_DD_7/Files/attributes/updateReasonType.xml).
:::

`updateReasonType` is the attribute that states what type of change a reason for update (`reasonForUpdate`) describes when a data module is revised. It is optional.

## Elements that carry it

`reasonForUpdate` is the only element that carries `updateReasonType`. `reasonForUpdate` is written inside the following elements.

| Parent element | Schema |
| --- | --- |
| `dmStatus` | The 21 data module schemas (`descript.xsd`, `proced.xsd` and others) |
| `pmStatus` | `pm.xsd` (publication module) |
| `imfStatus` | `icnmetadata.xsd` |
| `scormContentPackageStatus` | `scormcontentpackage.xsd` |
| `targetDmStatus` | `update.xsd` |
| `frontMatterDmEntry`, `frontMatterPmEntry`, `frontMatterExternalPubEntry` | `frontmatter.xsd` |

## Allowed values

The allowed values are decided in two steps: by the XML schema and by BREX (Business Rules Exchange).

| Defined by | Content |
| --- | --- |
| XML schema | The type is `updateReasonTypeAttType`. The values are an enumeration of 99 values, from `urt01` to `urt99` |
| Default BREX (BREX-S1-00242) | Allows only `urt01` to `urt05` and the range `urt51~urt99`. The rule applies to all schemas |

`urt06` to `urt50` pass XML schema validation, but they are violations in a check against the default BREX.

For each value, the default BREX also defines how a lower-level BREX can tailor it.

| Value | `valueForm` | `valueTailoring` |
| --- | --- | --- |
| `urt01` to `urt05` | `single` | `lexical` |
| `urt51~urt99` | `range` | `restrictable` |

## Meaning of the values

| Value | Meaning |
| --- | --- |
| `urt01` | An editorial change. The content has changed, but the change is considered not to matter technically |
| `urt02` | A technical change. The content has changed and the change needs a review |
| `urt03` | A change to the markup only |
| `urt04` | A change to the applicability only |
| `urt05` | A change to the unique identifier of the referencing structure |
| `urt51` to `urt99` | Values whose meaning the project defines |

## Choosing a value

The following table is a guide. If the business rules of the project define the choice, follow them.

| Situation | Value |
| --- | --- |
| A typo was corrected. The meaning of the step does not change | `urt01` |
| A step was added. A torque value was changed | `urt02` |
| Only the nesting of elements or the attributes were corrected. The displayed text does not change | `urt03` |
| An applicable model was added | `urt04` |

## Related rules

- A reason of type `urt01` has no change markup (`changeType`, `changeMark`) linked to it (Chap 3.9.5.2.1.1, Para 2.2).
- A `reasonForUpdate` without `updateReasonType` is treated as a technical change (the same Para 2.2).
- Changes made for the same reason point to the same `reasonForUpdate` (Chap 3.9.5.2.1.1, Para 2.1.3).
- An issue whose `issueType` is `revised` or `status` needs a `reasonForUpdate`, unless its `issueNumber` is `000` or `001` (BREX-S1-00038 of the default BREX).

## In this stack

| Operation | Tool |
| --- | --- |
| Read | `read_data_module` of [s1000d-reader-mcp](/s1000d-stack/mcp/reader-mcp/). `reasonForUpdates[]` of the identification and status section holds `updateReasonType` |
| Add only a reason for update | `add_reason_for_update` of [s1000d-writer-mcp](/s1000d-stack/mcp/writer-mcp/) |
| Add one when an in-work issue is started | `start_revision` of s1000d-writer-mcp (`reason`) |
| Add one together with change markup | `edit_data_module` of s1000d-writer-mcp (`marking.reason`) |
| Check whether a value is allowed | `lookup_value` of [s1000d-brex-mcp](/s1000d-stack/mcp/brex-mcp/) (`updateReasonType` in `target`, the value to check in `value`) |

No tool chooses the value of `updateReasonType`. Each tool takes the value the user has decided. The tools do not interpret the meaning of the value either.

## Sources

- Chap 3.9.6.1 (Table 82) and Chap 3.9.5.2.1.1 of the S1000D specification
- BREX-S1-00242 and BREX-S1-00038 of the default BREX
- [`updateReasonType` in the S1000D Issue 7 data dictionary](https://users.s1000d.org/S1000D_DD_7/Files/attributes/updateReasonType.xml). The first time the page is opened, it takes some time to display
