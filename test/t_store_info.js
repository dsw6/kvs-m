/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");


describe("Store Info", function () 
{

      //----------------------------------------------------------------------------
   it(`store.info method should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store.info).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`store.info method should return data`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});
      store.insert("key", "value");

      var info = store.info();
      expect(info.name).to.equal("myStore");
      expect(info.size).to.equal(1);
      expect(info.maxSize).to.equal(100);
      expect(info.itemTTL).to.equal(100);
   });



});
