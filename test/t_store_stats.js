/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");


describe("Store Stats", function () 
{

      //----------------------------------------------------------------------------
   it(`store.metrics method should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store.metrics).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`store.metrics method should return data`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key", "value");
      store.upsert("key", "value");
      store.get("key");
      store.del("key");
      store.clear();

      var stats = store.metrics();
      expect(stats.name, "prop:name - invalid").to.equal("myStore");
      expect(stats.size, "prop:size - invalid").to.equal(0);
      expect(stats.maxSize, "prop:maxSize - invalid").to.equal(100);
      expect(stats.operations.insert, "prop:requests.insert - invalid").to.equal(1);
      expect(stats.operations.upsert, "prop:requests.upsert - invalid").to.equal(1);
      expect(stats.operations.get, "prop:requests.get - invalid").to.equal(1);
      expect(stats.operations.del, "prop:requests.del - invalid").to.equal(1);
      expect(stats.operations.clear, "prop:requests.clear - invalid").to.equal(1);

   });


      //----------------------------------------------------------------------------
   it(`store.metrics current stats should not be zeroed after each call`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key", "value");
      store.insert("key2", "value2");

      var stats = store.metrics();
      stats = store.metrics();
      expect(stats.name, "prop:name - invalid").to.equal("myStore");
      expect(stats.size, "prop:size - invalid").to.equal(2);
      expect(stats.maxSize, "prop:maxSize - invalid").to.equal(100);
   });


      //----------------------------------------------------------------------------
   it(`store.metrics iterative stats should be zeroed after each call`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key", "value");

      var stats = store.metrics();
      stats = store.metrics();
      expect(stats.operations.insert, "prop:requests.insert - invalid").to.equal(0);
      expect(stats.operations.upsert, "prop:requests.upsert - invalid").to.equal(0);
      expect(stats.operations.get, "prop:requests.get - invalid").to.equal(0);
      expect(stats.operations.del, "prop:requests.del - invalid").to.equal(0);
      expect(stats.operations.clear, "prop:requests.clear - invalid").to.equal(0);
   });

});
