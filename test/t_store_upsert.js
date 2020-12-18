/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");


describe("Store Upsert", function () 
{

      //----------------------------------------------------------------------------
   it(`store.upsert method should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store.upsert).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`store.upsert should add item to store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.upsert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
   });


      //----------------------------------------------------------------------------
   it(`store.upsert maxSize should be honored`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 1, itemTTL: 100});

      var error = store.upsert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      error = store.upsert("key2", "value2");
      expect(error.code, "prop:error.code - invalid").to.equal(kvs.ERRORS.MAX_SIZE);
   });


      //----------------------------------------------------------------------------
   it(`store.upsert should replace existing item in store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.upsert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.upsert("key1", "newValue");
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("newValue");
   });


      //----------------------------------------------------------------------------
   it(`store.upsert should support volative item types`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.upsert("key1", "value1", kvs.TYPE.VOLATILE);
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
      expect(vInfo.type, "prop:type - invalid").to.equal(kvs.TYPE.VOLATILE);
   });


      //----------------------------------------------------------------------------
   it(`store.upsert should default to volative item types`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.upsert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
      expect(vInfo.type, "prop:type - invalid").to.equal(kvs.TYPE.VOLATILE);
   });


      //----------------------------------------------------------------------------
   it(`store.upsert should ignore invalid item types`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.upsert("key1", "value1", "unknown");
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
      expect(vInfo.type, "prop:type - invalid").to.equal(kvs.TYPE.VOLATILE);
   });

      //----------------------------------------------------------------------------
   it(`store.upsert should support permanente item types`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.upsert("key1", "value1", kvs.TYPE.PERM);
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
      expect(vInfo.type, "prop:type - invalid").to.equal(kvs.TYPE.PERM);
   });

});
