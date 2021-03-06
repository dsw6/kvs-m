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


describe("Store Delete", function () 
{

      //----------------------------------------------------------------------------
   it(`store.del method should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store.del).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`store.del should remove item from store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value");

      var error = store.del("key1");

      var info = store.info();
      expect(info.size, "prop:size - invalid").to.equal(0);
   });


      //----------------------------------------------------------------------------
   it(`store.del should not delete permanent items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value", kvs.ITEM_TYPE.PERM);

      var error = store.del("key1");
      expect(error.code, "error.code - invalid").to.equal(kvs.ERROR_CODE.NO_DELETE);
   });


      //----------------------------------------------------------------------------
   it(`store.del should not delete non-existant items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.del("key1");
      expect(error.code, "error.code - invalid").to.equal(kvs.ERROR_CODE.NOT_FOUND);
   });


      //----------------------------------------------------------------------------
   it(`store.del should delete volatile items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value", kvs.ITEM_TYPE.VOLATILE);

      var error = store.del("key1");
      expect(error, "error - invalid").to.not.exist;
   });


      //----------------------------------------------------------------------------
   it(`store.del should not delete expired items`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value", kvs.ITEM_TYPE.VOLATILE);

         // short sleep to allow item to expire, but not for reaper to trigger
      await sleep(250);

      var error = store.del("key1");
      expect(error.code, "error.code - invalid").to.equal(kvs.ERROR_CODE.NOT_FOUND);
   });


      //----------------------------------------------------------------------------
   it(`store.del should not delete permanent expired items`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value", kvs.ITEM_TYPE.PERM);

         // short sleep to allow item to expire, but not for reaper to trigger
      await sleep(250);

      var error = store.del("key1");
      expect(error.code, "error.code - invalid").to.equal(kvs.ERROR_CODE.NO_DELETE);
   });

});
