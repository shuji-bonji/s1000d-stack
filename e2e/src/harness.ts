/**
 * 4 本の MCP サーバー（brex・verify・reader・writer）を stdio のプロセスとして起動し、Client を束ねる。
 *
 * - E2E_TARGET=npm（既定）: node_modules にある公開版（@shuji-bonji/s1000d-*-mcp）の bin を起動する
 * - E2E_TARGET=local      : 手元の作業コピー（../mcp/<名前>/dist/index.js）を起動する（先に各リポジトリで npm run build）
 *
 * サーバーには S1000D_SPEC_DIR（モードで決まる）と S1000D_CONFIG（存在しない場所）だけを渡す。
 * 利用者の ~/.config/s1000d-stack/config.json や S1000D_CSDB_DIR は読ませない。
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport, getDefaultEnvironment } from '@modelcontextprotocol/client/stdio';

export const E2E_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const FIXTURES = join(E2E_ROOT, 'fixtures');

export type ServerName = 'brex' | 'verify' | 'reader' | 'writer';
export const SERVER_NAMES: ServerName[] = ['brex', 'verify', 'reader', 'writer'];

export const TARGET: 'npm' | 'local' = process.env.E2E_TARGET === 'local' ? 'local' : 'npm';

/** S1000D_SPEC_TESTS=1: 利用者が入手した Issue 7 の本物の XSD・既定 BREX で確かめる */
export const SPEC_MODE = process.env.S1000D_SPEC_TESTS === '1';

/** サーバーに渡す S1000D_SPEC_DIR。既定モードは自作の XSD だけを置いた fixtures/spec */
export function specDir(): string {
  if (!SPEC_MODE) return join(FIXTURES, 'spec');
  return resolve(E2E_ROOT, process.env.S1000D_SPEC_DIR ?? '../specs/s1000d/issue-7');
}

/** サーバー 1 本の起動に使うスクリプトのパス */
export function serverEntry(name: ServerName): string {
  if (TARGET === 'local') {
    return resolve(E2E_ROOT, '..', 'mcp', `s1000d-${name}-mcp`, 'dist', 'index.js');
  }
  // exports が package.json を公開していないので、node_modules の位置から直接読む
  const pkgJson = join(
    E2E_ROOT,
    'node_modules',
    '@shuji-bonji',
    `s1000d-${name}-mcp`,
    'package.json',
  );
  const pkg = JSON.parse(readFileSync(pkgJson, 'utf8')) as { bin: Record<string, string> };
  return join(dirname(pkgJson), pkg.bin[`s1000d-${name}-mcp`]);
}

/** 呼び出しの結果。isError はサーバーの isError、data は text を JSON として読んだもの */
export interface CallResult {
  isError: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  /** 応答の text そのもの */
  text: string;
}

export interface RunningServer {
  name: ServerName;
  client: Client;
  /** 起動したサーバーの版（initialize の serverInfo） */
  version: string;
  /** サーバーが stderr に出した行（落ちたときの調査用） */
  stderr: string[];
  tools: string[];
}

export interface Stack {
  servers: Record<ServerName, RunningServer>;
  /** ツール名からサーバーを選んで呼ぶ（ツール名は 4 本の間で重ならない） */
  call(tool: string, args?: Record<string, unknown>): Promise<CallResult>;
  /** 呼んだサーバーを名前で指す */
  callOn(server: ServerName, tool: string, args?: Record<string, unknown>): Promise<CallResult>;
  close(): Promise<void>;
}

async function start(name: ServerName): Promise<RunningServer> {
  const entry = serverEntry(name);
  if (!existsSync(entry)) {
    throw new Error(
      `${name}: ${entry} が無い。` +
        (TARGET === 'local'
          ? '各リポジトリで npm run build してから E2E_TARGET=local で実行する'
          : 'npm ci してから実行する'),
    );
  }
  const env: Record<string, string> = {
    ...getDefaultEnvironment(),
    S1000D_SPEC_DIR: specDir(),
    // 利用者の ~/.config を読まないよう、存在しない場所に向ける
    S1000D_CONFIG: join(tmpdir(), 's1000d-e2e-no-such-config.json'),
  };
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [entry],
    env,
    stderr: 'pipe',
  });
  const stderr: string[] = [];
  transport.stderr?.on('data', (b: Buffer) =>
    stderr.push(...b.toString().split('\n').filter(Boolean)),
  );
  const client = new Client({ name: `e2e-${name}`, version: '0.0.0' });
  await client.connect(transport);
  const tools = (await client.listTools()).tools.map((t) => t.name);
  return {
    name,
    client,
    version: client.getServerVersion()?.version ?? '?',
    stderr,
    tools,
  };
}

async function callServer(
  s: RunningServer,
  tool: string,
  args: Record<string, unknown>,
): Promise<CallResult> {
  const res = await s.client.callTool({ name: tool, arguments: args });
  const content = (res.content ?? []) as { type: string; text?: string }[];
  const text = content.find((c) => c.type === 'text')?.text ?? '{}';
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text }; // SDK の入力検証エラーは素の文字列で返る
  }
  return { isError: res.isError === true, data, text };
}

/** 4 本を起動する。テストファイルの beforeAll で呼び、afterAll で close する */
export async function startStack(): Promise<Stack> {
  const started = await Promise.all(SERVER_NAMES.map((n) => start(n)));
  const servers = Object.fromEntries(started.map((s) => [s.name, s])) as Record<
    ServerName,
    RunningServer
  >;
  const owner = new Map<string, RunningServer>();
  for (const s of started) {
    for (const t of s.tools) {
      if (owner.has(t))
        throw new Error(`ツール名 ${t} が ${owner.get(t)!.name} と ${s.name} で重なっている`);
      owner.set(t, s);
    }
  }
  return {
    servers,
    async call(tool, args = {}) {
      const s = owner.get(tool);
      if (!s) throw new Error(`どのサーバーにも無いツール: ${tool}`);
      return callServer(s, tool, args);
    },
    async callOn(server, tool, args = {}) {
      return callServer(servers[server], tool, args);
    },
    async close() {
      await Promise.allSettled(started.map((s) => s.client.close()));
    },
  };
}

/** フォルダーの直下のファイル名（並べ替え済み）。無ければ空 */
export function ls(dir: string): string[] {
  return existsSync(dir) ? readdirSync(dir).sort() : [];
}
