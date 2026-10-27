import test from 'node:test';
import assert from 'node:assert/strict';
import {gallerySequence,ease} from './scroll-sequence.js';

test('gallery keeps both endpoints stable and provides a separate exit runway',()=>{
  assert.deepEqual(gallerySequence(-1),{travel:0,index:0,exit:0});
  assert.equal(gallerySequence(.08).travel,0);
  assert.equal(gallerySequence(.44).travel,1);
  assert.equal(gallerySequence(.8).travel,2);
  assert.equal(gallerySequence(.84).exit,0);
  assert.deepEqual(gallerySequence(2),{travel:2,index:2,exit:1});
});
test('image travel and the exit remain continuous when scrolling in either direction',()=>{
  let previous=gallerySequence(0);
  for(let i=1;i<=1000;i++){
    const next=gallerySequence(i/1000);
    assert.ok(next.travel>=previous.travel&&next.travel-previous.travel<.003);
    assert.ok(next.exit>=previous.exit&&next.exit-previous.exit<.013);
    assert.ok(next.index>=0&&next.index<=2);
    previous=next;
  }
  assert.equal(ease(0),0);assert.equal(ease(1),1);
  assert.ok(ease(.001)<.000001&&1-ease(.999)<.000001);
});
