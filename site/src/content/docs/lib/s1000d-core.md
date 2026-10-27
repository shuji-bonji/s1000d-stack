---
title: s1000d-core (library)
description: The features and design of @shuji-bonji/s1000d-core, the TypeScript library shared by every MCP server in this stack.
---

`@shuji-bonji/s1000d-core` is a TypeScript library for reading S1000D® data modules and checking them against BREX (Business Rules Exchange). Every MCP server in this stack, starting with `s1000d-brex-mcp`, uses this library. It keeps the mapping to S1000D in one place, so that each MCP server does not interpret the specification on its own.

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

## Design decisions

### XML with @xmldom/xmldom, XPath with fontoxpath

The `objectPath` of a BREX rule is written in XPath, and the default BREX is full of expressions that lean on `descendant-or-self::` and `not(…)`. A survey of the 274 rules in the Issue 7 default BREX found one that uses XPath 2.0 syntax (`for … return some … satisfies`), which an XPath 1.0-only engine cannot evaluate. The library therefore uses `fontoxpath`, which implements XPath 3.1, and `@xmldom/xmldom` for the DOM. Both sit behind the `XmlEngine` interface so that they can be replaced.

Two points hit during implementation are worth recording. `fontoxpath` returns strings rather than nodes when an expression selects attributes, so the expression has to be evaluated as a node set first to keep the line number of each violation. `@xmldom/xmldom` 0.9 throws fatal syntax errors as exceptions, so the engine catches them and reports them in a uniform way.

### The check logic lives in the library

Both `s1000d-brex-mcp` (stage 1) and `s1000d-verify-mcp` (stage 2) check against BREX. Writing the same logic separately in two MCP servers would let the results diverge, so the check logic lives in this library and the MCP servers only call it.

### XSD validation with libxml2-wasm, implementation in a subpath

XSD validation uses `libxml2-wasm`. Compared with `xmllint-wasm`, it gave the same verdicts on the 33 Issue 7 XSD files and the 106 Bike Samples, and it was about 30 times faster because a compiled validator can be reused. The API used to resolve `xs:import` is marked experimental (`@alpha`), so, like `XmlEngine`, the validator sits behind the `SchemaValidator` interface, and the implementation is loaded from the subpath `@shuji-bonji/s1000d-core/xsd-libxml2`. `libxml2-wasm` is an optional peerDependency, so `s1000d-brex-mcp`, which does not use XSD validation, does not have to install it.

### The library decides the fix candidates

Fix suggestion (`suggestFixes`) returns, for each finding, candidates that say what to change, where, and to which value. The candidates are decided deterministically from the BREX rules, the XSD definitions, the CSDB index, the ids in the document and the ACT/CCT/PCT. No score is given; certainty is expressed in three levels, `exact` / `several` / `none`. This keeps the LLM from inventing allowed values or reference targets and limits it to choosing among the candidates and explaining them. As with applicability evaluation and conformance checks, what can be confirmed is done by the library, and only putting it into words is left to the LLM.

### No distribution files included; tests use self-made data

The S1000D specification, XSDs, default BREX and official samples cannot be redistributed, so they are not included in the package or the repository. The tests that run in CI use only self-made data: descriptive data modules for a fictional reserved-seat ticket machine, `KENBAIKI`, and a two-layer self-made BREX. Tests that use the distribution files run only when `S1000D_SPEC_TESTS=1` is set, and read the files the user obtained from `S1000D_SPEC_DIR`.

### Prepared for inconsistencies in the distribution files

The data dictionary in the distribution contains samples whose DMC in the file name does not match the DMC inside the file. A naive lookup falls into a loop: look for J, get back a file whose content is X, and X's parent is J. Checking a single data module took more than 2 minutes. The chain traversal now records the references it has visited, and the resolver prefers a file whose internal DMC matches the reference. Checking the 117 samples in the distribution (including the 106 Bike Samples) now takes about 10 seconds.

## Publishing and versions

Publishing to npm happens in GitHub Actions as a Trusted Publisher (OIDC) when a `v*` tag is pushed. While the version is 0.x, a dependency such as `^0.1.0` does not cross minor versions. When this library's minor version goes up, the dependency ranges of the MCP servers are raised and published again as well.
