/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");


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

      store.insert("key1", "value", kvs.TYPE.PERM);

      var error = store.del("key1");
      expect(error.code, "error.code - invalid").to.equal(kvs.ERRORS.NO_DEL);
   });


      //----------------------------------------------------------------------------
   it(`store.del should not delete non-existant items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.del("key1");
      expect(error.code, "error.code - invalid").to.equal(kvs.ERRORS.NOT_FOUND);
   });


      //----------------------------------------------------------------------------
   it(`store.del should delete volatile items`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      store.insert("key1", "value", kvs.TYPE.VOLATILE);

      var error = store.del("key1");
      expect(error, "error - invalid").to.not.exist;
   });

});
