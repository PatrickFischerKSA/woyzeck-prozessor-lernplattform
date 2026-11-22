import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import test from 'node:test';
const root=new URL('../out/',import.meta.url);
test('Pages export contains the working learning application and its scripts',async()=>{
  const shell=await readFile(new URL('index.html',root),'utf8');
  assert.match(shell,/<title>Woyzeck/);
  assert.match(shell,/\/woyzeck\/index\.html/);
  const html=await readFile(new URL('woyzeck/index.html',root),'utf8');
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(new Set(ids).size,ids.length,'All anchor and control IDs must be unique');
  for(const match of html.matchAll(/href="#([^"]+)"/g))assert.ok(ids.includes(match[1]),`Missing anchor ${match[1]}`);
  for(const match of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css|jpg))(?:\?[^"\s]*)?"/g))await access(new URL(`woyzeck/${match[1]}`,root));
  for(const id of ['inquiryInput','saveABtn','saveBBtn','versionComparison','restoreInput','manuscriptViewport','manuscriptImage','manuscriptZoom'])assert.ok(ids.includes(id),`Missing learning control ${id}`);
  assert.doesNotMatch(html,/<video|codex-preview/);
});
