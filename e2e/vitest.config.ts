import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // サーバー 4 本をプロセスとして起動し、XSD の検証もするので長めに取る
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // テストファイルごとに 4 プロセスを起動する。CI の負荷と、ログの読みやすさのため直列にする
    fileParallelism: false,
  },
});
