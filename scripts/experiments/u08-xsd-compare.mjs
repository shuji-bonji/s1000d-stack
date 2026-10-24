// U-08（XSD 検証の方式）の比較に使ったスクリプト（2026-10-24）。
// hub の依存には入れていないので、作業用フォルダーで次のように動かす。
//   mkdir u08 && cd u08 && npm init -y && npm pkg set type=module && npm install xmllint-wasm libxml2-wasm
//   S1000D_SPEC_DIR=/path/to/issue-7 node u08-xsd-compare.mjs libxml2        # 全件
//   S1000D_SPEC_DIR=/path/to/issue-7 node u08-xsd-compare.mjs xmllint 20     # 先頭 20 件
// 結果は DECISIONS.md「U-08 の比較結果（2026-10-24）」を参照。
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';
import { performance } from 'node:perf_hooks';

const SPEC = process.env.S1000D_SPEC_DIR;
const XSD_DIR = join(SPEC, 'xml-schema-package/S1000D Issue 7 XML Schema Package/xml_schema_flat');
const BIKE = join(SPEC, 'bike-samples/S1000D Issue 7 Bike Samples');
const which = process.argv[2]; // xmllint | libxml2
const limit = Number(process.argv[3] ?? 0);

function walk(d, out=[]) { for (const n of readdirSync(d)) { const p=join(d,n); statSync(p).isDirectory()? walk(p,out) : out.push(p);} return out; }
const dms = walk(BIKE).filter(p => /^DMC-.*\.xml$/i.test(basename(p))).sort();
const files = limit ? dms.slice(0, limit) : dms;

const xsdNames = readdirSync(XSD_DIR).filter(n => n.endsWith('.xsd'));
const xsdText = Object.fromEntries(xsdNames.map(n => [n, readFileSync(join(XSD_DIR, n), 'utf8')]));
const schemaOf = xml => (xml.match(/noNamespaceSchemaLocation="[^"]*\/([a-z]+\.xsd)"/i) ?? [])[1];
const hasEntity = xml => /<!ENTITY\s/.test(xml);

const result = { lib: which, total: files.length, valid: 0, invalid: 0, error: 0, withEntity: 0, bySchema: {}, samples: [] , ms: 0 };
const t0 = performance.now();

if (which === 'xmllint') {
  const { validateXML } = await import('xmllint-wasm');
  for (const f of files) {
    const xml = readFileSync(f, 'utf8'); const s = schemaOf(xml); if (hasEntity(xml)) result.withEntity++;
    result.bySchema[s] = (result.bySchema[s] ?? 0) + 1;
    try {
      const r = await validateXML({
        xml: [{ fileName: basename(f), contents: xml }],
        schema: [{ fileName: s, contents: xsdText[s] }],
        preload: xsdNames.filter(n => n !== s).map(n => ({ fileName: n, contents: xsdText[n] })),
        initialMemoryPages: 2048, maxMemoryPages: 16384,
      });
      if (r.valid) result.valid++; else { result.invalid++; if (result.samples.length < 5) result.samples.push({ file: basename(f), errors: r.errors.slice(0,2).map(e => e.message) }); }
    } catch (e) { result.error++; if (result.samples.length < 5) result.samples.push({ file: basename(f), thrown: String(e).slice(0, 300) }); }
  }
} else {
  const { XmlDocument, XsdValidator, XmlBufferInputProvider, xmlRegisterInputProvider, XmlValidateError } = await import('libxml2-wasm');
  const enc = new TextEncoder();
  xmlRegisterInputProvider(new XmlBufferInputProvider(Object.fromEntries(xsdNames.map(n => [n, enc.encode(xsdText[n])]))));
  const validators = {};
  const tS = performance.now();
  for (const f of files) {
    const xml = readFileSync(f, 'utf8'); const s = schemaOf(xml); if (hasEntity(xml)) result.withEntity++;
    result.bySchema[s] = (result.bySchema[s] ?? 0) + 1;
    let doc;
    try {
      if (!validators[s]) { const sd = XmlDocument.fromString(xsdText[s], { url: s }); validators[s] = XsdValidator.fromDoc(sd); }
      doc = XmlDocument.fromString(xml, { url: basename(f) });
      validators[s].validate(doc); result.valid++;
    } catch (e) {
      if (e instanceof XmlValidateError) { result.invalid++; if (result.samples.length < 5) result.samples.push({ file: basename(f), errors: e.details?.slice(0,2).map(d => d.message) ?? [e.message] }); }
      else { result.error++; if (result.samples.length < 5) result.samples.push({ file: basename(f), thrown: String(e).slice(0, 300) }); }
    } finally { doc?.dispose(); }
  }
  result.schemaCompileNote = `validators built: ${Object.keys(validators).length}`;
}
result.ms = Math.round(performance.now() - t0);
console.log(JSON.stringify(result, null, 1));
