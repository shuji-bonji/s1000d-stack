---
title: s1000d-core (library)
description: The features and design of @shuji-bonji/s1000d-core, the TypeScript library shared by every MCP server in this stack.
---

`@shuji-bonji/s1000d-core` is a TypeScript library for reading S1000D® data modules, checking them against BREX (Business Rules Exchange), and building them. Every MCP server in this stack, starting with `s1000d-brex-mcp`, uses this library. It keeps the mapping to S1000D in one place, so that each MCP server does not interpret the specification on its own.

[GitHub](https://github.com/shuji-bonji/s1000d-core) / [npm](https://www.npmjs.com/package/@shuji-bonji/s1000d-core)

```sh
npm install @shuji-bonji/s1000d-core
```

## What it does

| Feature | Functions |
| --- | --- |
| Parse and format a DMC (with or without a learn code) | `parseDmc` / `formatDmc` / `sameDmc` / `isBrexDmc` |
| Parse and format a DMC file name (issue information, language, extension) | `parseDmcFileName` / `formatDmcFileName` |
| Parse and format an ICN (MIC-based and CAGE-based) | `parseIcn` / `formatIcn` / `parseIcnFileName` |
| Infer the schema name and issue from `xsi:noNamespaceSchemaLocation` | `parseSchemaLocation` |
| Read the identification and status section | `readDataModuleInfo` / `readIdentAndStatus` / `readDmRef` |
| Read a BREX and look up SNS codes | `readBrex` / `allRules` / `lookupSns` |
| Check against BREX (one layer, several layers, a chain) | `checkAgainstBrexLayer` / `checkAgainstBrexLayers` / `checkAgainstBrexChain` / `resolveBrexChain` |
| Resolver that treats a folder as a CSDB | `listDataModules` / `findDataModule` / `createDirectoryBrexResolver` |
| Read XML and evaluate XPath | `XmlEngine` / `defaultXmlEngine` |
| Pick one BREX from how it is specified (path, DMC, or omitted = default BREX) | `locateBrex` / `findDefaultBrex` |
| Find and validate against XSD (implementation in the `xsd-libxml2` subpath) | `findSchemaDirs` / `locateXsd` / `SchemaValidator` / `Libxml2SchemaValidator` |
| Collect and resolve references (`dmRef` / `pmRef` / ICN / `internalRef` / `applicRefId`) | `collectReferences` / `resolveReferences` / `CsdbIndex` |
| Applicability (read the ACT, CCT and PCT; three-valued evaluation of `assert` / `evaluate`) | `readAct` / `readCct` / `readPct` / `ApplicEvaluator` |
| Read content (descript / proced / process / fault / pm) into a common shape | `readContent` / `readContentFromXml` |
| Verification status that combines one data module's checks (well-formedness, XSD, BREX, references) | `verifyDataModule` / `VerificationStatus` |
| Fix candidates from the verification result and from applicability that cannot be decided | `suggestFixes` / `findUndeterminedApplicability` / `findApplicTables` |
| Swapping where the CSDB lives (a folder by default) | `CsdbSource` / `DirectoryCsdbSource` / `MemoryCsdbSource` / `CsdbIndex.fromSource` |
| Reading a DML (data module list) and a DDN (data dispatch note) and reconciling them with the CSDB | `readDml` / `readDdn` / `reconcileDml` / `reconcileDdn` |
| Building a data module from a draft (`DraftDataModule`) and numbering DMCs, ICNs and PMCs | `buildDataModule` / `buildContent` / `allocateDmc` / `allocateIcn` / `allocatePmc` |
| Applying fix candidates to a document (only a selection that matches a candidate) | `applyFix` / `applyFixes` |
| A CSDB place that can be written to | `WritableCsdbSource` / `isWritableCsdbSource` |
| Building a comment data module | `buildComment` |
| Taking out sentences for translation and putting them back | `extractSegments` / `applySegments` |

```ts
import { readFileSync } from 'node:fs';
import { checkAgainstBrexChain, createDirectoryBrexResolver } from '@shuji-bonji/s1000d-core';

const resolve = createDirectoryBrexResolver([process.env.S1000D_SPEC_DIR!, './csdb']);
const report = await checkAgainstBrexChain(readFileSync('./csdb/DMC-….XML', 'utf8'), resolve);

console.log(report.passed, report.unresolved);
for (const layer of report.layers) {
  console.log(layer.brex.title, layer.violations.length, layer.manualChecks.length);
}
```

## Writing features

Version 0.8.0 added the processing that writes data modules. [s1000d-writer-mcp](/s1000d-stack/mcp/writer-mcp/) calls it. Existing APIs are unchanged. So that an LLM does not have to write XML, the input is limited to a structured draft, and this library builds the XML.

```ts
import { CsdbIndex, applyFixes, buildDataModule, suggestFixes, verifyDataModule } from '@shuji-bonji/s1000d-core';

const csdb = CsdbIndex.fromDirs(['./csdb']);

// Build the XML from a draft and the numbering rules (the LLM does not write XML)
const built = buildDataModule(draft, allocation, { index: csdb, specDirs: [process.env.S1000D_SPEC_DIR!] });
console.log(built.fileName, built.dmCode, built.ledger, built.icnNext);

// Verify, and apply only the fixes that have exactly one candidate (exact)
const result = await verifyDataModule(built.xml, { schema: { validator, schemaDirs }, brex: { resolver }, references: { csdb } });
const fixes = suggestFixes(result, { xml: built.xml, csdb });
const exact = fixes.filter((f) => f.confidence === 'exact').map((fix) => ({ fix, candidate: fix.candidates[0]! }));
const applied = applyFixes(built.xml, exact, { offered: fixes });
console.log(applied.appliedCount, applied.results.filter((r) => !r.applied).map((r) => r.reason));
```

### The draft (`DraftDataModule`)

`buildDataModule(draft, allocation, options)` builds the XML of the identification and status section and the content section from a `DraftDataModule`. There are 5 kinds (descript / proced / process / fault / pm), and `buildContent` builds the content section. The body of a draft, `DraftNode`, is a subset of the same vocabulary as the `ContentNode` that `readContent` returns. A round-trip test fixes the property that a tree that was read can be written back as it is.

The shape of the input is checked before XSD validation, and a mistake is returned as `DraftInputError`. This check does not replace XSD validation. In proced and fault, the required preconditions and postconditions that the input does not give are filled with elements that mean "none". `qualityAssurance` is set to `unverified`, which states that nothing has been verified. What was filled in is written to `notes` of the result. The JSON Schema of the input is distributed as `@shuji-bonji/s1000d-core/schema/draft.schema.json` and can be used as is for the input schema of an MCP tool.

### Numbering (`Allocation`)

`allocateDmc` / `allocateIcn` / `allocatePmc` decide numbers from an `Allocation` (the model identification code, the SNS, the information code for each kind in `rules.infoCodeByKind`, and the CAGE code) and the ledger `ledger`. The same `sourceId` gets the same DMC. The ledger comes in with the input and goes out in the result, so the library keeps no state.

There is no default information code. `infoCodeByKind` is required, and omitting it is a mistake in the input. The meaning of an information code is the project's decision, and this library does not decide the value.

### Applying fixes (`applyFix`)

`applyFix` / `applyFixes` apply the candidates returned by `suggestFixes` (`replace` / `remove` / `add` / `retarget`) to a document through the DOM. When `verify` or `offered` is passed, they compute the candidates again and check that the location and the candidate match, and a selection that does not match is not applied (`candidate-not-offered`). For `range` and `pattern` candidates, `matchesRange` / `matchesPattern` check that the value fits the range or the regular expression. The position of an element added by `add` is decided from the order of child elements in the XSD (`XsdIndex`). The XML declaration and the DOCTYPE (the `ENTITY` / `NOTATION` declarations of ICNs) are kept. Only the whitespace inside a start tag is normalised to a single space.

### A place that can be written to (`WritableCsdbSource`)

This is an interface that extends `CsdbSource` with `writeText` and `writeBytes` (for files that are not text, such as the original files of ICNs). `DirectoryCsdbSource` (which writes into the first folder) and `MemoryCsdbSource` implement it. When a file of the same name exists, it throws `CsdbWriteConflictError`, and it overwrites only when `overwrite` is passed. Like `CsdbSource` it is synchronous, and a product that can only write asynchronously receives the built XML and writes it itself.

### Comment data modules (`buildComment`)

`buildComment` builds a comment data module that follows the structure of `comment.xsd`. `commentType`, `commentPriorityCode`, `responseType` and `issueType` are written as the enumeration given, with no meaning attached. If `seqNumber` is omitted, it is the next number for the same model, sender and year in the CSDB. Verification now follows the BREX chain for publication modules and comments as well (`readBrexDmRefOf`).

### Sentences for translation (`extractSegments` / `applySegments`)

`extractSegments` returns only the sentences that a person reads (titles, paragraphs, steps, warnings, table cells and figure titles) as `Segment[]`. Inline elements become the placeholders `{1}` `{2}`, and `skeletonHash` is returned too. `applySegments` checks with `skeletonHash` that the skeleton is the same, puts the translated sentences back, and returns a data module that differs only in `language`. If the skeleton differs, it stops with `SkeletonMismatchError`. It does not translate.

## Design decisions

### XML with @xmldom/xmldom, XPath with fontoxpath

The `objectPath` of a BREX rule is written in XPath, and the default BREX is full of expressions that lean on `descendant-or-self::` and `not(…)`. A survey of the 274 rules in the Issue 7 default BREX found one that uses XPath 2.0 syntax (`for … return some … satisfies`), which an XPath 1.0-only engine cannot evaluate. The library therefore uses `fontoxpath`, which implements XPath 3.1, and `@xmldom/xmldom` for the DOM. Both sit behind the `XmlEngine` interface so that they can be replaced.

Two points hit during implementation are worth recording. `fontoxpath` returns strings rather than nodes when an expression selects attributes, so the expression has to be evaluated as a node set first to keep the line number of each violation. `@xmldom/xmldom` 0.9 throws fatal syntax errors as exceptions, so the engine catches them and reports them in a uniform way.

### The check logic lives in the library

Both `s1000d-brex-mcp` (stage 1) and `s1000d-verify-mcp` (stage 2) check against BREX. Writing the same logic separately in two MCP servers would let the results diverge, so the check logic lives in this library and the MCP servers only call it.

### XSD validation with libxml2-wasm, implementation in a subpath

XSD validation uses `libxml2-wasm`. Compared with `xmllint-wasm`, it gave the same verdicts on the 33 Issue 7 XSD files and the 106 Bike Samples, and it was about 30 times faster because a compiled validator can be reused. The API used to resolve `xs:import` is marked experimental (`@alpha`), so, like `XmlEngine`, the validator sits behind the `SchemaValidator` interface, and the implementation is loaded from the subpath `@shuji-bonji/s1000d-core/xsd-libxml2`. `libxml2-wasm` is an optional peerDependency, so `s1000d-brex-mcp`, which does not use XSD validation, does not have to install it.

### The library decides the fix candidates

Fix suggestion (`suggestFixes`) returns, for each finding, candidates that say what to change, where, and to which value. The candidates are decided deterministically from the BREX rules, the XSD definitions, the CSDB index, the ids in the document and the ACT/CCT/PCT. No score is given; certainty is expressed in three levels, `exact` / `several` / `none`. This keeps the LLM from inventing allowed values or reference targets and limits it to choosing among the candidates and explaining them. As with applicability evaluation and conformance checks, what can be confirmed is done by the library, and only putting it into words is left to the LLM. The processing that applies a chosen candidate to a document (`applyFix`) also checks it against the candidates before applying it, so a value outside the candidates cannot get in.

### Where the CSDB lives can be swapped

By default the library treats `DMC-….XML` files inside a folder as the CSDB (`CsdbIndex.fromDirs`). A product's CSDB is a database or an API, so listing the CSDB objects (`list()`) and fetching their content (`readText()`) are gathered in the `CsdbSource` interface, which is swapped the same way as `XmlEngine` / `SchemaValidator` (0.5.0). The index is built with `CsdbIndex.fromSource(source)`, and other data modules (ACT/CCT/PCT, the BREX chain, reference targets) are read through the index's `read()`. The interface is synchronous: reference resolution and fix-candidate decisions are synchronous functions, and making them asynchronous would change their API, so a store that can only be read asynchronously is loaded first and passed to `MemoryCsdbSource`. Writing was added with `WritableCsdbSource` (0.8.0).

### No distribution files included; tests use self-made data

The S1000D specification, XSDs, default BREX and official samples cannot be redistributed, so they are not included in the package or the repository. The tests that run in CI use only self-made data: descriptive data modules for a fictional reserved-seat ticket machine, `KENBAIKI`, and a two-layer self-made BREX. Tests that use the distribution files run only when `S1000D_SPEC_TESTS=1` is set, and read the files the user obtained from `S1000D_SPEC_DIR`.

### Prepared for inconsistencies in the distribution files

The data dictionary in the distribution contains samples whose DMC in the file name does not match the DMC inside the file. A naive lookup falls into a loop: look for J, get back a file whose content is X, and X's parent is J. Checking a single data module took more than 2 minutes. The chain traversal now records the references it has visited, and the resolver prefers a file whose internal DMC matches the reference. Checking the 117 samples in the distribution (including the 106 Bike Samples) now takes about 10 seconds.

## Publishing and versions

The current version is 0.8.0.

Publishing to npm happens in GitHub Actions as a Trusted Publisher (OIDC) when a `v*` tag is pushed. While the version is 0.x, a dependency such as `^0.1.0` does not cross minor versions. When this library's minor version goes up, the dependency ranges of the MCP servers are raised and published again as well.
