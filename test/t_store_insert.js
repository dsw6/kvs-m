/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");


describe("Store Insert", function () 
{

      //----------------------------------------------------------------------------
   it(`store.insert method should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store.insert).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`store.insert should add item to store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
   });


      //----------------------------------------------------------------------------
   it(`store.insert maxSize should be honored`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 1, itemTTL: 100});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      error = store.insert("key2", "value2");
      expect(error.code, "prop:error.code - invalid").to.equal(kvs.ERROR_CODE.MAX_SIZE);
   });


      //----------------------------------------------------------------------------
   it(`store.insert should error if item exists in store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var error = store.insert("key1", "value1");
      expect(error.code, "error.code - invalid").to.equal(kvs.ERROR_CODE.ITEM_EXISTS);
   });


      //----------------------------------------------------------------------------
   it(`store.insert should support volative item types`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1", kvs.ITEM_TYPE.VOLATILE);
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
      expect(vInfo.type, "prop:type - invalid").to.equal(kvs.ITEM_TYPE.VOLATILE);
   });


      //----------------------------------------------------------------------------
   it(`store.insert should default to volative item types`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1");
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
      expect(vInfo.type, "prop:type - invalid").to.equal(kvs.ITEM_TYPE.VOLATILE);
   });


      //----------------------------------------------------------------------------
   it(`store.insert should ignore invalid item types`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1", "unknown");
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
      expect(vInfo.type, "prop:type - invalid").to.equal(kvs.ITEM_TYPE.VOLATILE);
   });

      //----------------------------------------------------------------------------
   it(`store.insert should support permanent item types`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.insert("key1", "value1", kvs.ITEM_TYPE.PERM);
      expect(error, "prop:error - invalid").to.not.exist;

      var vInfo = store.get("key1");
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
      expect(vInfo.type, "prop:type - invalid").to.equal(kvs.ITEM_TYPE.PERM);
   });

});
