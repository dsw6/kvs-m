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
      expect(kvs.TYPE).to.be.an("object");
      expect(kvs.TYPE.VOLATILE).to.exist;
      expect(kvs.TYPE.PERM).to.exist;
   });

      //----------------------------------------------------------------------------
   it(`kvs.ERRORS should be exported`, function () 
   {
      expect(kvs.ERRORS).to.be.an("object");
      expect(kvs.ERRORS.MAX_SIZE).to.exist;
      expect(kvs.ERRORS.NOT_FOUND).to.exist;
      expect(kvs.ERRORS.EXISTS).to.exist;
      expect(kvs.ERRORS.NO_DEL).to.exist;
   });

});
