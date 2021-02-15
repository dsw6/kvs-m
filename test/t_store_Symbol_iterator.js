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
   it(`iterator should return [key, value] array`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      for (let item of store)
      {
         expect(item).to.be.an("array");
         expect(item[0]).to.equal("key1");
         expect(item[1]).to.equal("value1");
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
      var keys = ["key1", "key2"];
      var values = ["value1", "value2"];
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert(keys[0], values[0]);
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert(keys[1], values[1]);
      expect(error, "prop:error - invalid").to.not.exist;

      for (let [key, value] of store)
      {
         expect(keys).to.contain(key);
         expect(values).to.contain(value);
      }
   });


      //----------------------------------------------------------------------------
   it(`iterator should return correct number of items`, function () 
   {
      var count=0;
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

      for (let item of store)
         count++;

      expect(count).to.equal(2);
   });


      //----------------------------------------------------------------------------
   it(`iterator should skip deleted items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

      error = store.del("key1");

      for (let [key, value] of store)
      {
         expect(key).to.not.equal("key1");
         expect(value).to.not.equal("value1");
      }
   });


      //----------------------------------------------------------------------------
   it(`iterator should skip all deleted items`, function () 
   {
      var count = 0;
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

      error = store.del("key1");
      error = store.del("key2");

      for (let item of store)
         count++;

      expect(count).to.equal(0);
   });

         //----------------------------------------------------------------------------
   it(`iterator should skip expired items`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

         // short sleep to allow item to expire, but not for reaper to trigger
      await sleep(250);

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

      for (let [key, value] of store)
      {
         expect(key).to.not.equal("key1")
         expect(value).to.not.equal("value1");
      }
   });


         //----------------------------------------------------------------------------
   it(`iterator should skip all expired items`, async function () 
   {
      var count=0;
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key2", "value2");
      expect(error, "prop:error - invalid").to.not.exist;

         // short sleep to allow item to expire, but not for reaper to trigger
      await sleep(250);

      for (let item of store)
         count++;
      
      expect(count).to.equal(0);
   });

});
