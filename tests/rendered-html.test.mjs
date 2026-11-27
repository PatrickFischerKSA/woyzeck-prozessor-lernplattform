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
  for(const match of html.matchAll(/(?:src|href|poster)="([^"#]+\.(?:js|css|jpg))(?:\?[^"\s]*)?"/g))if(!/^https?:/.test(match[1]))await access(new URL(`woyzeck/${match[1]}`,root));
  for(const id of ['inquiryInput','saveABtn','saveBBtn','versionComparison','restoreInput','manuscriptViewport','manuscriptImage','manuscriptZoom','montageReadingInput','montageEvidenceInput','montageRevisionInput','montageSuggestions','revealMontageBtn'])assert.ok(ids.includes(id),`Missing learning control ${id}`);
  assert.doesNotMatch(html,/codex-preview/);
  const videos=[...html.matchAll(/<video\b([^>]*)>([\s\S]*?)<\/video>/g)];
  assert.equal(videos.length,4,'Three fish films and the grave film are embedded');
  for(const [,attrs,body] of videos){
    assert.match(attrs,/\bcontrols\b/,'Learners control playback');
    assert.match(attrs,/aria-label=/,'Every film has an accessible name');
    assert.doesNotMatch(attrs,/\bautoplay\b/,'Films start only on request');
    assert.match(body,/https:\/\/www\.zurichstories\.org\/georgbPatrickFischer\/assets\//,'Original films remain on Zurichstories');
  }
});


test('learning menu opens independent units instead of nested chapters',async()=>{
  const html=await readFile(new URL('woyzeck/index.html',root),'utf8');
  const stack=[]; const views=[];
  for(const match of html.matchAll(/<\/?section\b[^>]*>/g)){
    const tag=match[0];
    if(tag.startsWith('</')){assert.ok(stack.length,'Balanced section closing');stack.pop();continue;}
    const id=tag.match(/\bid="([^"]+)"/)?.[1];
    if(/\bclass="[^"]*\bview\b/.test(tag)){
      assert.equal(stack.length,0,`Unit ${id} must not be nested in another chapter`);
      views.push(id);
      assert.equal(/\bhidden\b/.test(tag),id!=='auftakt','Only the first unit is initially visible');
    }
    stack.push(id);
  }
  assert.equal(stack.length,0);
  const menu=[...html.matchAll(/data-view="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(views.length,13);
  assert.deepEqual(menu,views,'Every unit appears once in the menu and in learning order');
  assert.equal([...html.matchAll(/class="unit-pagination"/g)].length,views.length,'Every unit offers a next step');
  assert.ok(html.indexOf('id="forschungsfilme"')<html.indexOf('class="fish-cinema"'),'Fish films belong to their own unit');
});
