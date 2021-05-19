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


describe("Store [Symbol.iterator]", function () 
{

      //----------------------------------------------------------------------------
   it(`store[Symbol.iterator] method should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store[Symbol.iterator]).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`store[Symbol.iterator] should return iterator object`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var iterator = store[Symbol.iterator]();
      expect(iterator.next).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`iterator should return object: {key, value, type}`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      for (let item of store)
      {
         expect(item.key).to.equal("key1");
         expect(item.value).to.equal("value1");
         expect(item.type).to.equal(kvs.ITEM_TYPE.VOLATILE);
      }
   });


      //----------------------------------------------------------------------------
   it(`iterator should work with empty store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var iterator = store.entries();

      for (let item of store)
         expect.fail("no items should be returned");
   });


      //----------------------------------------------------------------------------
   it(`iterator should work with multipe values in store`, function () 
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

      var iterCount = 0;
      for (let {key, value, type} of store)
      {
         iterCount++;
         expect(keys).to.contain(key);
         expect(values).to.contain(value);
         expect(type).to.equal(kvs.ITEM_TYPE.VOLATILE);
      }

      expect(iterCount).to.equal(count);      
   });


      //----------------------------------------------------------------------------
   it(`iterator should skip deleted items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      store.insert("key1", "value1");
      store.insert("key2", "value2");
      store.del("key1");

      for (let {key, value, type} of store)
      {
         expect(key).to.not.equal("key1");
         expect(value).to.not.equal("value1");
         expect(type).to.equal(kvs.ITEM_TYPE.VOLATILE);
      }
   });


      //----------------------------------------------------------------------------
   it(`iterator should skip all deleted items`, function () 
   {
      var count = 0;
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      store.insert("key1", "value1");
      store.insert("key2", "value2");
      store.del("key1");
      store.del("key2");

      for (let item of store)
         count++;

      expect(count).to.equal(0);
   });

         //----------------------------------------------------------------------------
   it(`iterator should skip expired items`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value1");
      await sleep(300); // short sleep to allow item to expire, but not for reaper to trigger
      store.insert("key2", "value2");

      for (let {key, value, type} of store)
      {
         expect(key).to.not.equal("key1")
         expect(value).to.not.equal("value1");
         expect(type).to.equal(kvs.ITEM_TYPE.VOLATILE);
      }
   });


         //----------------------------------------------------------------------------
   it(`iterator should skip all expired items`, async function () 
   {
      var count=0;
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value1");
      store.insert("key2", "value2");

         // short sleep to allow item to expire, but not for reaper to trigger
      await sleep(300);

      for (let item of store)
         count++;
      
      expect(count).to.equal(0);
   });


         //----------------------------------------------------------------------------
   it(`iterator should return permanent times`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value1", kvs.ITEM_TYPE.PERM);
      store.insert("key2", "value2");

         // short sleep to allow items to expire
      await sleep(250);

      var itemCnt = 0;

      for (let {key, value, type} of store)
      {
         itemCnt++;
         expect(key).to.equal("key1")
         expect(value).to.equal("value1");
         expect(type).to.equal(kvs.ITEM_TYPE.PERM);
      }

      expect(itemCnt, "Permanent item not found").to.equal(1);
   });

});
