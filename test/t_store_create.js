/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");

const DEFAULT_ITEM_TTL  = (5 * 60 * 1000);  // 5 minutes
const DEFAULT_MAX_SIZE = 10000;  // 10,000 items

describe("Store Creation", function () 
{

      //----------------------------------------------------------------------------
   it(`store methods should be present`, function () 
   {
      var store = kvs({});

      expect(store).to.be.an("object");
      expect(store.insert).to.be.an("function");
      expect(store.upsert).to.be.an("function");
      expect(store.get).to.be.an("function");
      expect(store.del).to.be.an("function");
      expect(store.clear).to.be.an("function");
      expect(store.metrics).to.be.an("function");
      expect(store.info).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`no opts should result in defaults being used`, function () 
   {
      var store = kvs();
      var info = store.info();
      expect(info.name).to.match(/^kvs-*/);
      expect(info.size).to.equal(0);
      expect(info.maxSize).to.equal(DEFAULT_MAX_SIZE);
      expect(info.itemTTL).to.equal(DEFAULT_ITEM_TTL);
   });


      //----------------------------------------------------------------------------
   it(`empty opts should result in defaults being used`, function () 
   {
      var store = kvs({});
      var info = store.info();
      expect(info.name).to.match(/^kvs-*/);
      expect(info.size).to.equal(0);
      expect(info.maxSize).to.equal(DEFAULT_MAX_SIZE);
      expect(info.itemTTL).to.equal(DEFAULT_ITEM_TTL);
   });


      //----------------------------------------------------------------------------
   it(`non-object opts should throw an error`, function () 
   {
      try { kvs("not an object"); }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
         return;
      }

      expect.fail("create function did not throw error");
   });


      //----------------------------------------------------------------------------
   it(`opts.name should use value`, function () 
   {
      var store = kvs({name: "myStore"});
      var info = store.info();
      expect(info.name).to.equal("myStore");
   });


      //----------------------------------------------------------------------------
   it(`opts.name, not a string should throw an error`, function () 
   {
      try { kvs({name: 123}); }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
         return;
      }

      expect.fail("create function did not throw error");
   });


      //----------------------------------------------------------------------------
   it(`opts.maxSize should use value`, function () 
   {
      var store = kvs({maxSize: 100});
      var info = store.info();
      expect(info.maxSize).to.equal(100);
   });


      //----------------------------------------------------------------------------
   it(`opts.maxSize, not a number should throw an error`, function () 
   {
      try { kvs({maxSize: "hello"}); }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
         return;
      }

      expect.fail("create function did not throw error");
   });


      //----------------------------------------------------------------------------
   it(` opts.maxSize = 0, should throw an error`, function () 
   {
      try { kvs({maxSize: 0}); }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
         return;
      }

      expect.fail("create function did not throw error");
   });

      //----------------------------------------------------------------------------
   it(` opts.maxSize < 0, should throw an error`, function () 
   {
      try { kvs({maxSize: -1}); }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
         return;
      }

      expect.fail("create function did not throw error");
   });


      //----------------------------------------------------------------------------
   it(`opts.itemTTL should use value`, function () 
   {
      var store = kvs({itemTTL: 100});
      var info = store.info();
      expect(info.itemTTL).to.equal(100);
   });


      //----------------------------------------------------------------------------
   it(` opts.itemTTL, not a number should throw an error`, function () 
   {
      try { kvs({itemTTL: "hello"}); }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
         return;
      }

      expect.fail("create function did not throw error");
   });


      //----------------------------------------------------------------------------
   it(` opts.itemTTL = 0, should throw an error`, function () 
   {
      try { kvs({itemTTL: 0}); }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
         return;
      }

      expect.fail("create function did not throw error");
   });

      //----------------------------------------------------------------------------
   it(` opts.itemTTL < 0, should throw an error`, function () 
   {
      try { kvs({maxSize: -1}); }
      catch(err){
         expect(err.message).to.contain("invalid parameter");
         return;
      }

      expect.fail("create function did not throw error");
   });


});
