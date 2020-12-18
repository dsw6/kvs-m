/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");


describe("Store Error Object", function () 
{


      //----------------------------------------------------------------------------
   it(`error object should be properly defined`, function () 
   {
      var store = kvs({name: "myStore", maxSize: 100, itemTTL: 100});

      var error = store.del("key1");
      expect(error.name, "error.name - invalid").to.equal("KVSError");
      expect(error.message, "error.message - invalid").to.exist;
      expect(error.stack, "error.stack - invalid").to.exist;
      expect(error.code, "error.code - invalid").to.exist;
   });


});
