/*
 * Simple Key/Value Store
 *
 * A simple memory-based key/value store, with max size and item TTL.
 * When items are added to the store, they are given an expiration timestamp.
 * The expiration time is Date.now() plus TTL.  When items are queried the
 * expiration timestamp is updated.
 *
 * A reaper timer event is used to actively managed the store contents.
 * Items that have expired are removed from the store.  An item is
 * expired if it's expiration timestamp has passed.
 *
 * The store also provides an information method that provides basic
 * stats about the store.
 *
 * Copyright(c) 2017-2020 David Ward
 * MIT Licensed
 */


'use strict';

const debug = require("debug")("kvs-m");

const DEFAULT_ITEM_TTL  = (5 * 60 * 1000);  // 5 minutes
const DEFAULT_MAX_SIZE = 10000;  // 10,000 items

const ITEM_TYPE = {
   PERM: 0,       // permanent item, don't delete
   VOLATILE: 1    // delete-able
};

const ERROR_CODE = {
   MAX_SIZE:      0,      // max size reached, item cannot be added
   NOT_FOUND:     1,      // item not found
   ITEM_EXISTS:   2,      // item already exists
   NO_DELETE:     3       // item cannot be deleted
};

const storeName = "kvs-";
var storeCount = 0;


//====================================================================
// public interface - factory function
module.exports = createStore;
module.exports.ITEM_TYPE = ITEM_TYPE;
module.exports.ERROR_CODE = ERROR_CODE;



/**
 * Store Item: items are simple key:value pairs with a expiration timestamp
 *  key              - key
 *  value            - value
 *  exp              - expiration, (epoc time, milliseconds)
 *  type             - permanent / volatile
 */
function StoreItem(key, value, type, itemTTL)
{
   this.key    = key;
   this.value  = value;
   this.exp    = Date.now() + itemTTL;
   this.type   = type;
}


/**
 * Store:
 *  name        - name given to the store
 *  maxSize     - max number of items in the store
 *  itemTTL     - Time-To-Live for items in the store (milliseconds)
 *  purgeTimer  - timer used to clean expired items
 *  items       - storage object, properties are keys
 *
 * Notes:  the purger timer interval adds some jitter (0-5 seconds).
 * If multiple stores are created in rapid succession using defaults,
 * this gives some variability to when the timers fire.
 */
function Store(opts)
{
   this.name     = opts.name,
   this.maxSize  = opts.maxSize,
   this.itemTTL  = opts.itemTTL,
   this.size     = 0,
   this.items    = {},
   this.operations = {
      insert: 0,
      upsert: 0,
      get: 0,
      del: 0,
      clear: 0
   }
   this.purgeTimer = setInterval(purge, ((this.itemTTL/2) + (Math.random() * (5000))), this).unref();
}


/**
 * Create a store
 * @param {Object} opts - options for store
 * @param {string} [opts.name] - name, useful for stats tracking (optional, default="kvs-<count>")
 * @param {number} [opts.maxSize] - max number of items (optional, default=10,000)
 * @param {number} [opts.itemTTL]  - time (milliseconds) an item will live in the store (optional, default=5min)
 */
function createStore(opts)
{
   opts = opts || {};
   if (typeof(opts) !== "object")
      throw new Error("invalid parameter, opts must be an object");      

   opts.name    = opts.hasOwnProperty("name") ? opts.name : (storeName + ++storeCount);
   opts.maxSize = opts.hasOwnProperty("maxSize") ? opts.maxSize : DEFAULT_MAX_SIZE;
   opts.itemTTL = opts.hasOwnProperty("itemTTL")  ? opts.itemTTL : DEFAULT_ITEM_TTL;

   if (typeof(opts.name) !== "string")
      throw new Error("invalid parameter, opts.name must be a string");  

   if (typeof(opts.maxSize) !== "number" || opts.maxSize <= 0)
      throw new Error("invalid parameter, opts.maxSize must be a positive number");  

   if (typeof(opts.itemTTL) !== "number" || opts.itemTTL <= 0)
      throw new Error("invalid parameter, opts.itemTTL must be a positive number");  

   var _store = new Store( opts );

   debug(`${_store.name}  maxSize:${_store.maxSize}, itemTTL:${_store.itemTTL}`);

   var store = {
      insert: insertFunc, 
      upsert: upsertFunc, 
      get: getFunc, 
      del: delFunc, 
      clear: clearFunc, 
      entries: entriesFunc,
      [Symbol.iterator]: entriesFunc,
      metrics: metricsFunc, 
      info: infoFunc
   };

   return(store);


   // ------------------------------------------------------------------------------------------
   // The following functions are wrapped in the closure and provide the interface to the
   // store

        // insert item, error if item already exists --------------------------
   function insertFunc(key, value, type)
   {
      debug(`${_store.name} insert - key:${key}`);
      _store.operations.insert++;

      if ( _store.size >= _store.maxSize )
         return(new KVSError(ERROR_CODE.MAX_SIZE, "insert failed, max size reached"));

      if ( _store.items[key] )
         return(new KVSError(ERROR_CODE.ITEM_EXISTS, "insert failed, key already exists"));

      if ( type !== ITEM_TYPE.PERM ) type = ITEM_TYPE.VOLATILE;

      _store.size++;
      _store.items[key] = new StoreItem(key, value, type, _store.itemTTL);
      return(undefined);
   }

      // update/insert, creates item or overwrites existing item --------------
   function upsertFunc(key, value, type)
   {
      debug(_store.name + " upsert - key: " + key);
      _store.operations.upsert++;

      if ( type !== ITEM_TYPE.PERM ) type = ITEM_TYPE.VOLATILE;

         // replace existing item
      if (_store.items[key])
      {
         _store.items[key] = new StoreItem(key, value, type, _store.itemTTL);
         return(undefined)
      }

      if ( _store.size >= _store.maxSize )
         return(new KVSError(ERROR_CODE.MAX_SIZE, "insert failed, max size reached"));

      _store.size++;
      _store.items[key] = new StoreItem(key, value, type, _store.itemTTL);
      return(undefined);
   }

      // get item -------------------------------------------------------------
   function getFunc(key)
   {
      debug(`${_store.name} get:${key}`);
      var now = Date.now();
      var item = _store.items[key];
      _store.operations.get++;

         // permanent items never expire
      if ( !item || ((ITEM_TYPE.PERM !== item.type) && (item.exp < now)) )
         return( {error: new KVSError(ERROR_CODE.NOT_FOUND, "item not found"), value: undefined, type: undefined} );

      item.exp = now + _store.itemTTL;
      return( {error: undefined, value: item.value, type: item.type} );
   }


        // del item -----------------------------------------------------------
   function delFunc(key)
   {
      debug(_store.name + " del: " + key);
      var item = _store.items[key];
      _store.operations.del++;

      if ( !item )
        return(new KVSError(ERROR_CODE.NOT_FOUND, "item not found"));

      if (ITEM_TYPE.PERM === item.type)
         return(new KVSError(ERROR_CODE.NO_DELETE, "cannot delete item"));

      if ( item.exp < Date.now() )
        return(new KVSError(ERROR_CODE.NOT_FOUND, "item not found"));

      _store.size--;
      delete _store.items[key];
      return(undefined);
   }

        // clear all items ----------------------------------------------------
   function clearFunc()
   {
      var orgItems = _store.items;
      _store.operations.clear++;
      _store.size = 0;
      _store.items = {};

      var keys = Object.keys(orgItems);
      var len = keys.length;
      var key;
      var item;

      for (var i=0; i<len; i++)
      {
         key = keys[i];
         item = orgItems[key];

            // transfer permenant items to new store
         if (ITEM_TYPE.PERM === item.type)
         {
            _store.items[key] = item;
            _store.size++;
         }
      }

      debug(`${_store.name} cleared, new size: ${_store.size}`);
      return(undefined);
   }

        // basic cache stats --------------------------------------------------
   function metricsFunc()
   {
      // Note: There are two types of stats, current and iterative.
      //
      // Current stats provide information about the current state.
      // Iterative stats provide information about activity since the previous
      // stats function call.  Iterative stats are reset with each call to stats.       

      var stats = {
         name:     _store.name,
         size:     _store.size,
         maxSize:  _store.maxSize,

            // iterative stats
         operations: Object.assign({}, _store.operations)
      };

      _store.operations.insert = 0;
      _store.operations.upsert = 0;
      _store.operations.get = 0;
      _store.operations.del = 0;
      _store.operations.clear = 0;

      return(stats);
   }

        // basic information about the store ----------------------------------
   function infoFunc()
   {
      var info = {
         name:     _store.name,
         size:     _store.size,
         maxSize:  _store.maxSize,
         itemTTL:  _store.itemTTL
      };

      return(info);
   }

        // returns an iterator for the store ----------------------------------
   function entriesFunc()
   {
      debug(`${_store.name} entries:${_store.size}`);      
      var keys = Object.keys(_store.items);
      var i = 0;

      return({next: nextFunc});

      function nextFunc() 
      {
         var key = null;
         var item = null;
         var now = Date.now();
         _store.operations.get++;

         while (!item && i < keys.length)
         {
            key = keys[i++];
            item = _store.items[key];

               // items have been removed after the iterator was created
            if (!item) continue;

               // permanent items are always returned
            if (ITEM_TYPE.PERM === item.type) continue;

               // item is expired, skip it
            if ( (item.exp < now) ) item = null;
         }

         if (item)
            return({value: {key: key, value: item.value, type: item.type}, done: false});
         else
            return({value: undefined, done: true});
      }
   }
}


   // Remove all expired items from the store.  Invoked by the purge timer, which invokes this routine passing in the store
function purge(store)
{
   var now = Date.now();
   var keys = Object.keys(store.items);
   var len = keys.length;
   var size = store.size;
   var key;
   var item;

   for (var i=0; i<len; i++)
   {
      key = keys[i];
      item = store.items[key];

      if (ITEM_TYPE.PERM === item.type) continue;

      if (item.exp < now)
      {
         delete store.items[key];
         store.size--;
      }
   }

   debug(store.name + ", purged: " + (size - store.size) + ", remaining: " + store.size);
   return;
}

   // New error object for store, prototypically inherits from the Error constructor
function KVSError(code, message)
{
  this.name = 'KVSError';
  this.message = message;
  this.code  = code;
  Error.captureStackTrace(this, KVSError);
}

KVSError.prototype = Object.create(Error.prototype);
KVSError.prototype.constructor = KVSError;

