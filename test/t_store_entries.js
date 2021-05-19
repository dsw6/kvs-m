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
   it(`iterator.next() should set value={key, value, type} object`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      store.insert("key1", "value1");

      var iterator = store.entries();
      var resp = iterator.next();
      expect(resp.value).to.be.an("object");
      expect(resp.done).to.equal(false);

      var item = resp.value;
      expect(item.key).to.equal("key1");
      expect(item.value).to.equal("value1");
      expect(item.type).to.equal(kvs.ITEM_TYPE.VOLATILE);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should work with empty store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var iterator = store.entries();
      var resp = iterator.next();
      expect(resp.value).to.be.equal(undefined);
      expect(resp.done).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should work with multipe values in store`, function () 
   {
      var count = 100;
      var keys = [];
      var values = [];

      var store = kvs({name: "myStore", maxSize: 200, itemTTL: 5000});

      for (let i=0; i<count; i++)
      {
         let key = `key${i}`;
         let value = `value${i}`;
         store.insert(key, value);
         keys.push(key);
         values.push(value);
      }

      var iterator = store.entries();
      var resp = iterator.next();

      var iterCount = 0;
      var item = resp.value;
      while (item)
      {
         iterCount++;
         expect(keys).to.contain(item.key);
         expect(values).to.contain(item.value);
         expect(item.type).to.equal(kvs.ITEM_TYPE.VOLATILE);

         resp = iterator.next();
         item = resp.value;
      } 

      expect(iterCount).to.equal(count);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should return done=true when iteration complete`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      store.insert("key1", "value1");
      store.insert("key2", "value2");

      var iterator = store.entries();
      var resp = iterator.next();
      resp = iterator.next();
      resp = iterator.next();
      expect(resp.value).to.equal(undefined);
      expect(resp.done).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should skip deleted items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      store.insert("key1", "value1");
      store.insert("key2", "value2");

      var iterator = store.entries();
      store.del("key1");

      var resp = iterator.next();
      expect(resp.done).to.equal(false);

      var item = resp.value;
      expect(item.key).to.equal("key2");
      expect(item.value).to.equal("value2");

      resp = iterator.next();
      expect(resp.value).to.equal(undefined);
      expect(resp.done).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should skip all deleted items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      store.insert("key1", "value1");
      store.insert("key2", "value2");

      var iterator = store.entries();
      store.del("key1");
      store.del("key2");

      var resp = iterator.next();
      expect(resp.value).to.equal(undefined);
      expect(resp.done).to.equal(true);
   });

         //----------------------------------------------------------------------------
   it(`iterator.next() should skip expired items`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value1");
      await sleep(250);  // short sleep to allow item to expire, but not for reaper to trigger
      store.insert("key2", "value2");

      var iterator = store.entries();

      var resp = iterator.next();
      expect(resp.done).to.equal(false);

      var item = resp.value;
      expect(item.key).to.equal("key2");
      expect(item.value).to.equal("value2");

      resp = iterator.next();
      expect(resp.value).to.equal(undefined);
      expect(resp.done).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should skip all expired items`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value1");
      store.insert("key2", "value2");

         // short sleep to allow item to expire, but not for reaper to trigger
      await sleep(250);

      var iterator = store.entries();

      var resp = iterator.next();
      expect(resp.value).to.equal(undefined);
      expect(resp.done).to.equal(true);
   });


      //----------------------------------------------------------------------------
   it(`iterator.next() should return permanent items`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value1", kvs.ITEM_TYPE.PERM);
      store.insert("key2", "value2");

         // short sleep to allow items to expire
      await sleep(250);

      var iterator = store.entries();

      var resp = iterator.next();
      expect(resp.done, "iterator returned done").to.equal(false);

      var item = resp.value;
      expect(item.key).to.equal("key1");
      expect(item.value).to.equal("value1");
      expect(item.type).to.equal(kvs.ITEM_TYPE.PERM);      
   });

});
