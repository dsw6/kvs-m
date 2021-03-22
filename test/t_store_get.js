/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");


describe("Store Get", function () 
{

      //----------------------------------------------------------------------------
   it(`store.get method should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store.get).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`store.get should return item from store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      store.insert("key1", "value1");

      var vInfo = store.get("key1");
      expect(vInfo, "prop:error - not found").to.haveOwnProperty("error");
      expect(vInfo, "prop:value - not found").to.haveOwnProperty("value");
      expect(vInfo, "prop:type - not found").to.haveOwnProperty("type");

      expect(vInfo.error, "prop:error - invalid").to.equal(undefined);
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
      expect(vInfo.type, "prop:type - invalid").to.equal(kvs.ITEM_TYPE.VOLATILE);
   });


      //----------------------------------------------------------------------------
   it(`store.get should not return non-existant items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 5000});

      var vInfo = store.get("key1");
      expect(vInfo, "prop:error - not found").to.haveOwnProperty("error");
      expect(vInfo, "prop:value - not found").to.haveOwnProperty("value");
      expect(vInfo, "prop:type - not found").to.haveOwnProperty("type");

      expect(vInfo.error, "prop:error - invalid").to.exist;
      expect(vInfo.error.code, "prop:err.code - invalid").to.equal(kvs.ERROR_CODE.NOT_FOUND);
      expect(vInfo.value, "prop:value - invalid").to.equal(undefined);
      expect(vInfo.type, "prop:type - invalid").to.equal(undefined);
   });


});
