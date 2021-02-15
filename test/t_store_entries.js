/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");

// ---- pause n milliseconds, ex: await sleep(1000)
function sleep(ms)
{
   return( new Promise(pSleep) );
   function pSleep(resolve) { setTimeout(resolve, ms); };
}


describe("Store Entries", function () 
{

      //----------------------------------------------------------------------------
   it(`store.entries method should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store.entries).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`store.entries should return iterator object`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var iterator = store.entries();
      expect(iterator.next).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should set value=[key, value] array`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var iterator = store.entries();
      var item = iterator.next();
      expect(item.value).to.be.an("array");
      expect(item.done).to.equal(false);
      expect(item.value[0]).to.equal("key1");
      expect(item.value[1]).to.equal("value1");
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should work with empty store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var iterator = store.entries();
      var item = iterator.next();
      expect(item.value).to.be.equal(undefined);
      expect(item.done).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should work with multipe values in store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

      var iterator = store.entries();

      var item = iterator.next();
      expect(item.value[0]).to.equal("key1");
      expect(item.value[1]).to.equal("value1");
      expect(item.done).to.equal(false);

      var item = iterator.next();
      expect(item.value[0]).to.equal("key2");
      expect(item.value[1]).to.equal("value2");
      expect(item.done).to.equal(false);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should return done=true when iteration complete`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

      var iterator = store.entries();

      var item = iterator.next();
      var item = iterator.next();
      var item = iterator.next();
      expect(item.value).to.equal(undefined);
      expect(item.done).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should skip deleted items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

      var iterator = store.entries();
      error = store.del("key1");

      var item = iterator.next();
      expect(item.value[0]).to.equal("key2");
      expect(item.value[1]).to.equal("value2");
      expect(item.done).to.equal(false);

      var item = iterator.next();
      expect(item.value).to.equal(undefined);
      expect(item.done).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should skip all deleted items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

      var iterator = store.entries();
      error = store.del("key1");
      error = store.del("key2");

      var item = iterator.next();
      expect(item.value).to.equal(undefined);
      expect(item.done).to.equal(true);
   });

         //----------------------------------------------------------------------------
   it(`iterator.next() should skip expired items`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

         // short sleep to allow item to expire, but not for reaper to trigger
      await sleep(250);

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

      var iterator = store.entries();

      var item = iterator.next();
      expect(item.value[0]).to.equal("key2");
      expect(item.value[1]).to.equal("value2");
      expect(item.done).to.equal(false);

      var item = iterator.next();
      expect(item.value).to.equal(undefined);
      expect(item.done).to.equal(true);
   });


         //----------------------------------------------------------------------------
   it(`iterator.next() should skip all expired items`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

         // short sleep to allow item to expire, but not for reaper to trigger
      await sleep(250);

      var iterator = store.entries();

      var item = iterator.next();
      expect(item.value).to.equal(undefined);
      expect(item.done).to.equal(true);
   });

});
