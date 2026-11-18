---
title: s1000d-publish
description: Explains what you provide to the Skill that builds S1000D data modules one by one from a structured draft, verifies them and puts them in a CSDB, the MCP servers it needs, its flow and what it does not do. It also explains the procedure for inserting, removing and moving nodes in a data module that is already in the CSDB, and the procedure for starting an in-work issue of a released issue and adding change markup.
---

`s1000d-publish` is a Skill that builds S1000D® data modules one by one from a structured draft, verifies them and puts them in a CSDB. It is a procedure for the authors of technical documents, and it does not go through an experiential manual. It also handles requests to insert, remove or move steps, paragraphs, warnings and list items in a procedural or descriptive data module that is already in the CSDB. It also has a procedure for starting an in-work issue of a released issue and adding change markup and reasons for update. A Skill tells Claude which MCP servers to call in which order and what to ask the user at each step; it has no building or verification processing of its own.

[GitHub](https://github.com/shuji-bonji/s1000d-publish-skill) / [Release](https://github.com/shuji-bonji/s1000d-publish-skill/releases)

## What it does

- **You provide**: the material (text, notes or existing data modules), the CSDB folder to write to, the security classification and the numbering rules. You decide the kind of data module (descriptive, procedural, process or fault isolation) together with the Skill.
- **You receive**: one verified data module, the result of checking whether the new data module is listed in the data management list (DML), and a Publish Report (verification status, fixes applied automatically and the files written). The files are written after you confirm.

## Required MCP servers

| MCP server | Required | Minimum version | Role |
| --- | --- | --- | --- |
| [s1000d-writer-mcp](/s1000d-stack/mcp/writer-mcp/) | Required | 0.6.0 | Builds and verifies a data module from a draft (`build_data_module`) and applies the fixes you chose (`apply_fixes`). Edits the structure of a data module in the CSDB (`edit_data_module`), starts an in-work issue (`start_revision`) and adds a reason for update (`add_reason_for_update`) |
| [s1000d-verify-mcp](/s1000d-stack/mcp/verify-mcp/) | Required | 0.6.1 | Verifies the data module that was written (`verify_data_module`) and reconciles it with the DML (`reconcile_dml`) |
| [s1000d-brex-mcp](/s1000d-stack/mcp/brex-mcp/) | Optional | 0.4.0 | Explains the rules of the BREX of the project to the author (`explain_brex`) |
| [s1000d-reader-mcp](/s1000d-stack/mcp/reader-mcp/) | Optional | 0.13.0 | Checks the title, issue and references of a data module in the CSDB (`read_data_module`). It is not used to rebuild a data module from what was read. The `edit_data_module` procedure needs it to get the places to edit |

When a required server is not connected, the Skill does not start; it explains how to connect the server and stops. When an optional server is not connected, the Skill writes "not performed (tool not connected)" in the matching item of the report.

## Flow

```mermaid
flowchart LR
  A["Decide the material and<br/>the kind with the user"] --> B["Summarise the rules of<br/>the project BREX"]
  B --> C["Create a draft;<br/>the user confirms it"]
  C --> D["Build and verify<br/>without writing"]
  D --> E["The user chooses<br/>the remaining fixes"]
  E --> F["Write after confirmation<br/>and verify"]
  F --> G["Reconcile with the DML"]
  G --> H["Publish Report"]
```

1. It confirms the material, whether this is a new data module or a new issue built from revised material, the CSDB folder to write to and the security classification, and decides the kind of data module with you.
2. When the brex server is connected, it summarises the rules of the BREX of the project for the author. It adds no rule that is not in the response.
3. It asks for the numbering rules. There is no default information code, so it asks for the codes your project has registered.
4. It creates a draft made only of titles, paragraphs, steps, warnings, tables and references, and shows it to you for confirmation. It does not write the DMC or the BREX reference.
5. It builds and verifies without writing. Among the remaining fixes, you choose from the candidates when there are several, and it asks you when there is none.
6. After you confirm the destination, it writes the data module and verifies it.
7. It reconciles with the DML and reports whether the new data module is listed in it. When it is not listed, the Skill tells you.
8. It summarises the result and the verification status in a Publish Report.

## Changing the structure of a data module in the CSDB

A request to insert, remove or move steps, paragraphs, warnings (cautions, notes) or list items in a procedural or descriptive data module that is already in the CSDB is handled with `edit_data_module` of the writer server. The Skill does not read the data module and build it again from a draft, because the elements and attributes that a draft cannot express would be lost. `edit_data_module` rewrites only the edited ranges of the original XML.

To change a released issue by the S1000D rules for issues, the Skill starts an in-work issue with `start_revision` of the writer server and adds change markup with `marking` of `edit_data_module` (from 0.4.0).

```mermaid
flowchart LR
  A["Confirm what to change<br/>and the issue"] --> R["For a released issue,<br/>start an in-work issue"]
  R --> M["Ask the user whether<br/>to add change markup"]
  M --> B["Get the places<br/>with the reader"]
  B --> C["Compose the edits"]
  C --> D["Call without writing<br/>and read the result"]
  D --> E["The user<br/>confirms"]
  E --> F["Write and<br/>verify"]
```

1. It confirms which data module to change, where and how, and looks at the issue information (`issueInfo`). A released issue (`inWork` is `00`) cannot be edited as it is. The Skill asks you to choose one of three: start an in-work issue and change it by the S1000D rules, rewrite it without changing the issue (a prototype or an exercise), or stop.
2. To start an in-work issue, it asks you for the `issueType` (`changed`, `revised` or `status`) and calls `start_revision` of the writer server. The in-work issue is written as a new file, and the file of the released issue does not change. From here on, the Skill works on the new file.
3. Before it edits an in-work issue, it asks you for the kind of change. For a change that is shown with change markup, it also asks for the text of the reason for update, `updateReasonType` and `changeMark`. It adds no change markup for an editorial change (`urt01`).
4. It calls `read_data_module` of the reader server with `includeLocation: true` and copies the `location.path` of the nodes. To remove or move only the text of a step (a paragraph that is returned merged into the `text` of the step node), it copies the place in `textLocations` of the step node. It does not build a place itself.
5. It composes the edits (`insert`, `remove`, `move`). A node to insert is a draft node; the Skill writes no XML. It does not add an `id` that you did not give. To add change markup, it adds `marking`. The first edit for a reason uses `marking.reason`, and an edit from the second one for the same reason uses `marking.reasonRefId`.
6. It calls the tool without writing. For a refused edit (`refusals[]`), it acts according to the reason. When the edits introduce XSD errors (`newSchemaErrors[]`), it changes the position or the edit and calls again. When another data module refers to an `id` that was removed (`referencedFromOtherObjects[]`), it asks you.
7. It shows you the places that change and the verification status, and waits for your confirmation. With change markup, it also shows which markup each element gets and the reason for update that is added. Without it, it shows that the issue and change markup are not changed.
8. It writes the data module, verifies it with the verify server and reports. The report says that the issue has not been released.
9. It adds the reason of a change that has no change markup (the reason of an editorial change, or the reason of an issue whose `issueType` is `revised` or `status`) with `add_reason_for_update` of the writer server.

The Skill cannot handle the following requests yet, and says so.

- Inserting, removing or moving tables, illustrations or the items of the preliminary requirements
- Rewriting the text of a paragraph
- Releasing an issue (setting `inWork` back to `00` and raising the issue number), and updating the issue date or the quality assurance status
- Adding change markup to a part of a sentence (`changeInline`), or to tables and illustrations

A request to replace a node with other content can be handled only with change markup. The Skill passes, in the same call, an edit that removes the original node and an edit that inserts the new node beside it. The original node is kept with `delete` markup.

## What the Skill does not do

- It does not write XML. It writes only the draft, and the writer server builds the XML.
- It does not decide the information code, the security classification or the applicability without asking you.
- It does not fix with a value outside the candidates.
- It does not explain the rules of a BREX with content that is not in the response of the server.
- It does not create or update a DML. The writer server does not have that function yet, so when the data module is not listed, you add it with your own tool.
- It does not write `schema-not-found` or `not-run` as a pass. It does not judge conformance to S1000D.
- It does not rewrite a released issue unless you say so explicitly (it does not pass `allowReleasedIssue: true` on its own judgment).
- It does not start an in-work issue without asking you. It does not decide the `issueType`, the text of the reason for update, `updateReasonType` or `changeMark` either.
- It does not report that the issue was released or raised. It only starts an in-work issue, and the issue number does not go up. It does not report that change markup was added when it did not pass `marking`.

## Installing

In Claude Code, install it with the following command.

```text
/plugin install s1000d-publish@shuji-bonji
```

The required MCP servers are declared as dependencies in the `plugin.json` of the Skill. The settings of the MCP servers (such as `S1000D_SPEC_DIR`) are described in [Getting started](/s1000d-stack/guide/getting-started/).

## Related pages

- [s1000d-writer-mcp](/s1000d-stack/mcp/writer-mcp/): the server that builds data modules.
- [s1000d-verify-mcp](/s1000d-stack/mcp/verify-mcp/): the server that verifies and reconciles with the DML.
- [s1000d-brex-mcp](/s1000d-stack/mcp/brex-mcp/): the server that explains the BREX of the project.
- [experience-to-s1000d](/s1000d-stack/skill/experience-to-s1000d/): the Skill for converting an experiential manual in one go.
