#!/usr/bin/env node
// Crucix Static Export Script
// Runs a full data sweep and writes data.json to stdout or a file
// Usage: node scripts/export-static.mjs [output-path]

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { fullBriefing } from '../apis/briefing.mjs';
import { synthesize } from '../dashboard/inject.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = process.argv[2] || join(__dirname, '../_site/data.json');

console.error('[export-static] Starting full data sweep...');

try {
  const rawData = await fullBriefing();
  console.error(`[export-static] Briefing complete: ${rawData?.meta?.sourcesOk || 0}/${rawData?.meta?.sourcesQueried || 0} sources OK`);

  const synthesized = await synthesize(rawData);
  // Disable delta/ideas for static export
  synthesized.delta = { summary: { totalChanges: 0, criticalChanges: 0, direction: 'baseline' }, signals: {} };
  synthesized.ideas = [];
  synthesized.ideasSource = 'disabled';

  const dir = dirname(outPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(outPath, JSON.stringify(synthesized));
  console.error(`[export-static] data.json written to ${outPath}`);
  process.exit(0);
} catch (err) {
  console.error('[export-static] ERROR:', err.message || err);
  process.exit(1);
}
