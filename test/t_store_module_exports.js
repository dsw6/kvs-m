/*
 * Copyright(c) 2020 David Ward
 * MIT Licensed
 */


"use strict";

const expect = require("chai").expect;
const kvs = require("../lib/store");


describe("Store Module Exports", function () 
{

      //----------------------------------------------------------------------------
   it(`kvs method should be exported`, function () 
   {
      expect(kvs).to.be.an("function");
   });


      //----------------------------------------------------------------------------
   it(`kvs.TYPE should be exported`, function () 
   {
      expect(kvs.ITEM_TYPE).to.be.an("object");
      expect(kvs.ITEM_TYPE.VOLATILE).to.exist;
      expect(kvs.ITEM_TYPE.PERM).to.exist;
   });

      //----------------------------------------------------------------------------
   it(`kvs.ERROR_CODE should be exported`, function () 
   {
      expect(kvs.ERROR_CODE).to.be.an("object");
      expect(kvs.ERROR_CODE.MAX_SIZE).to.exist;
      expect(kvs.ERROR_CODE.NOT_FOUND).to.exist;
      expect(kvs.ERROR_CODE.ITEM_EXISTS).to.exist;
      expect(kvs.ERROR_CODE.NO_DELETE).to.exist;
   });

});
