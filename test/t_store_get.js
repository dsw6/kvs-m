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
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value1");

      var vInfo = store.get("key1");
      expect(vInfo.err, "prop:error - invalid").to.not.exist;
      expect(vInfo.value, "prop:value - invalid").to.equal("value1");
   });


      //----------------------------------------------------------------------------
   it(`store.get should not delete non-existant items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var vInfo = store.get("key1");
      expect(vInfo.err, "prop:error - invalid").to.exist;
      expect(vInfo.value, "prop:value - invalid").to.not.exist;
      expect(vInfo.err.code, "prop:err.code - invalid").to.equal(kvs.ERRORS.NOT_FOUND);
   });


});
