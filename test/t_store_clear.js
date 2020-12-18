/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");


describe("Store Clear", function () 
{

      //----------------------------------------------------------------------------
   it(`store.clear method should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store.clear).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`store.clear should remove items from store`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value");
      store.insert("key2", "value");
      store.insert("key3", "value");

      var error = store.clear();

      var info = store.info();
      expect(info.size, "prop:size - invalid").to.equal(0);

      var stats = store.info();
      expect(stats.size, "prop:size - invalid").to.equal(0);
   });


      //----------------------------------------------------------------------------
   it(`store.clear should not remove permanent items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value", kvs.TYPE.PERM);
      store.insert("key2", "value", kvs.TYPE.PERM);
      store.insert("key3", "value", kvs.TYPE.VOLATILE);

      var error = store.clear();

      var info = store.info();
      expect(info.size, "prop:size - invalid").to.equal(2);
   });

});
