# e2e — run the four MCP servers together and check how they cooperate

**English** | [日本語](./README.ja.md)

End-to-end tests that start `s1000d-brex-mcp`, `s1000d-verify-mcp`, `s1000d-reader-mcp` and `s1000d-writer-mcp` as real stdio processes and walk through the procedures of the four Skills (experience-to-s1000d, s1000d-publish, s1000d-review, s1000d-translate) mechanically. They check what the per-server unit tests (in-memory transport) cannot see: that a file written by one process is read the same way by another, that the response shapes the Skills rely on match the real responses, and that the servers agree with each other about the same data module.

These tests do not decide S1000D conformance. S1000D® is a registered trademark of ASD; this project is not affiliated with ASD. No specification, XSD or official sample is committed; with `S1000D_SPEC_TESTS=1` the tests only read the distribution you obtained yourself.

## Run

```sh
npm ci
npm test            # default mode, published npm versions
npm run test:spec   # S1000D_SPEC_TESTS=1: the real Issue 7 XSD and default BREX
npm run test:local  # E2E_TARGET=local: ../mcp/<name>/dist/index.js (build each repo first)
```

- `E2E_TARGET=npm` (default) starts the bins in `node_modules/@shuji-bonji/` (brex ^0.4.0, verify ^0.6.0, reader ^0.7.0, writer ^0.1.1). `local` starts `../mcp/<name>/dist/index.js`.
- Default mode uses only the self-made minimal XSDs in `fixtures/spec/xml_schema_flat/` and the two-layer self-made BREX in `fixtures/csdb-base/` (KBWORKS organisation layer, KENBAIKI project layer). `S1000D_SPEC_TESTS=1` reads `S1000D_SPEC_DIR` (default `../specs/s1000d/issue-7`); scenario 2 and the tests that depend on the self-made BREX rules are skipped there.
- Each test file creates its CSDB under `os.tmpdir()` and removes it afterwards (`E2E_KEEP_TMP=1` keeps it). The servers never read your `~/.config/s1000d-stack/config.json` or `S1000D_CSDB_DIR`.

## Scenarios

| File | Skill | What it checks |
|---|---|---|
| `01-experience-to-s1000d` | experience-to-s1000d | `convert_manual` dry run then write; `verify_csdb`; reader listing and outline; `reconcile_dml` on a CSDB that has a DML (found / issue-mismatch / not-found / notListed); the reader's DML summary equals verify's counts |
| `02-publish` | s1000d-publish | `exact` fixes applied automatically, `several` left in `fixes[]`; `apply_fixes` (applied / `candidate-not-offered` / `value-not-allowed`); `write` / `write-conflict` / `overwrite`; fixing a written file in place |
| `03-review` | s1000d-review | reader outline, `suggest_fixes` (`no-csdb` without `csdbDirs`), `manualChecks`, `create_comment` with `write: true`, the comment verified by verify, next `seqNumber` |
| `04-translate` | s1000d-translate | `extract_segments`, `apply_segments` (en-US, `write: true`), same DMC with `_EN-US.XML`, `placeholder-mismatch` / `unknown-id`, `skeleton-mismatch` |
| `05-consistency` | (cross-cutting) | brex and verify agree on BREX violations; writer's `verification` equals verify's result for the written file; whether a running verify/reader sees files that writer wrote later; omitting `allocation.brexDmRef` |

## Known failures

Four tests in `05-consistency` fail on purpose: they keep suspected server defects as plain failing tests (not `it.fails` / `it.todo`). Three show that verify and reader build their CSDB index once per folder set and never see files written afterwards; one shows `brex.state: "passed"` with `layers: 0` when a data module has no `brexDmRef`. Details are in the test bodies and in `README.ja.md`.

## CI

`.github/workflows/e2e.yml` (repository root) runs `npm ci && npm test` in `e2e/` on demand and once a week.
