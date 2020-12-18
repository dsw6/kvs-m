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


describe("Store Idle Reaper Event", function () 
{
   this.timeout(30000);

         //----------------------------------------------------------------------------
   it(`timed out items should be automatically removed from store`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value1");

         // sleep long enougth to allow the reaper to have trigger
      await sleep(5000);

      var vInfo = store.get("key1");
      expect(vInfo.err.code, "prop:err - invalid").to.equal(kvs.ERRORS.NOT_FOUND);

      var info = store.info();
      expect(info.size, "prop:size - invalid").to.equal(0);
   });


      //----------------------------------------------------------------------------
   it(`timed out items should not be returned even if the reaper hasn't cleared them`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value1");

         // short sleep to allow item to expire, but not for reaper to trigger
      await sleep(200);

      var vInfo = store.get("key1");
      expect(vInfo.err.code, "prop:err - invalid").to.equal(kvs.ERRORS.NOT_FOUND);

      var info = store.info();
      expect(info.size, "prop:size - invalid").to.equal(1);
   });


      //----------------------------------------------------------------------------
   it(`queried items should have TTL reset`, async function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 300});

      store.insert("key1", "value1");

         // sleep for a combined 400ms and query the item
         // twice, item should be present
      await sleep(200);
      var vInfo = store.get("key1");
      expect(vInfo.err).to.not.exist;

      await sleep(200);
      var vInfo = store.get("key1");
      expect(vInfo.err).to.not.exist;

         // sleep longer than itemTTL, should not be found
      await sleep(500)
      var vInfo = store.get("key1");
      expect(vInfo.err.code).to.equal(kvs.ERRORS.NOT_FOUND);

   });


});
