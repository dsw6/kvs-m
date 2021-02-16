# kvs-m

A memory-based key/value store with operational metrics.  

Items in the store have a expiration time and unused items are automatically removed from the store.  Each time an item is queried, it's expiration time is reset.



## Installation

This is a [node.js](https://nodejs.org) module available through the
[npm registry](https://www.npmjs.com/).

```sh
$ npm install @dsw/kvs-m
```

## Store Creation

The store factory function is used to create a new store.  

### **<span style="color:blue">kvs(opts)</span>**  
Creates a new store with the specified options.  

```
opts:
{
   name:       string, store name (optional)
   maxSize:    number, maximum number of items the store can hold (optional, default: 10,000)
   ttl:        number, time (ms) an item live in the store (optional, default:5 min)
}
```
- if opts.name isn't specified, a default is assigned.  Default names start with "kvs-" followed by the current number of stores (ex: "kvs-1")

Example: 
```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});
```

## Store Usage

### **<span style="color:blue">KVS Item Types<span>**  
When items are added to the store, an item type can be specified.  If not specified, the volatile type is used. 

- `kvs.ITEM_TYPE.PERM` - permanent, item will not time out, delete operation not allowed
- `kvs.ITEM_TYPE.VOLATILE` - volatile, item will time out, delete operation allowed

### **<span style="color:blue">KVS Errors<span>**  
Store operations that fail return a `KVSError` object which extends the standard `Error` object.  In addition to the standard error object properties, the KVSError objects has an error `code` property.

```
{
   name:  "KVSError",
   message:  <error message>
   stack: <error stack>
   code: <kvs error code>
}
```
Error Codes
- `kvs.ERROR_CODE.MAX_SIZE` - store max size reached, item cannot be added
- `kvs.ERROR_CODE.NOT_FOUND` - item not found in store
- `kvs.ERROR_CODE.ITEM_EXISTS` - item already exists in store
- `kvs.ERROR_CODE.NO_DELETE` - item cannot be deleted

### **<span style="color:blue">store.insert(key, value, [type])<span>**  
Adds an item to the store.  If an item with the key already exist in the store, an error is returned .  If the store is at max size, an error is returned.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

store.insert("key1", "value1", kvs.ITEM_TYPE.VOLATILE);
store.insert("key2", "value2", kvs.ITEM_TYPE.PERM);
```

### **<span style="color:blue">store.upsert(key, value, [type])<span>**  
Adds/replaces an item to the store.  If an item with the key already exists in the store, the item is replaced.  If an item does not already exist, the item is added.  If the store is at max size, an error is returned.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

   // item is added
store.upsert("key1", "value1");

   // item replaced
store.upsert("key1", "value2");
```

### **<span style="color:blue">store.get(key)<span>**  
Returns an information object which includes: the value, the type, and an error, if an error occured.
```
{
   error:   <kvsError>     // KVSError, undefined if no error
   value:   <item>         // the item value, undefined if an error occurrs
   type:    <item type>    // the item type, undefined if an error occurrs
}
```

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

store.insert("key1", "value1");
var info = store.get("key1");  

console.log(info.value);   // "value1"
console.log(info.type);    // kvs.ITEM_TYPE.VOLATILE
```

### **<span style="color:blue">store.entries()<span>**  
Returns a new Iterator object that can be used to enumerate all the items in the store.  Items added to the store after the Iterator is created will not be returned by the Iterator.  Expired items in the store will not returned by the Iterator.  The Iterator returns objects with the format:
```
{
   key:     <key>       // key value
   value:   <item>      // the item value, undefined if an error occurrs
   type:    <type>      // the item type, undefined if an error occurrs
}
```

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

store.insert("key1", "value1");
store.insert("key2", "value2");

var iterator = store.entries();

var item = iterator.next().value;
console.log(value); // {key: "key1, value: "value1", type: <kvs.ITEM_TYPE.VOLATILE> }
```

### **<span style="color:blue">store[Symbol.iterator]<span>**  
Returns a store iterator function, which is the store.entries() function.  This supports enumarting store entries using the for..of loop construct.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

store.insert("key1", "value1");
store.insert("key2", "value2");

for (let item of store)
   console.log(value); 
```

### **<span style="color:blue">store.del(key)<span>**  
Deletes the store item identified by the key.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

store.insert("key1", "value1");
var err = store.del("key1");
```

### **<span style="color:blue">store.clear()<span>**  
Removes all items in the store.  Items with a type of `kvs.ITEM_TYPE.PERM` are not removed.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

store.insert("key1", "value1", kvs.ITEM_TYPE.VOLATILE);
store.insert("key2", "value2", kvs.ITEM_TYPE.PERM);
err = store.clear();
   // "key2" still exists in the store
```

### **<span style="color:blue">store.metrics()<span>**  
Information about the number of items in the store and operations.  The operation counters (insert, upsert, etc.) are the number of operations since the last metrics call.  The counters are reset with each call.

Example Response:
```
{
   name:    "myStore",
   size:    250,
   maxSize: 5000,

      // reset with each call
   operations: {
      insert:  130,  
      upsert:  100,
      get:     50,
      del:     10,
      clear:   0
   }
}
```

### **<span style="color:blue">store.info()<span>**  
Returns the store configuration.  

Example Response:
```
{
   name:    "myStore",
   size:    250,
   maxSize: 5000,
   itemTTL: 20000
}
```

## Troubleshooting

The project uses the [debug package](https://www.npmjs.com/package/debug) which will log information to console.error.

The package uses the debug prefix `kvs-m`.  

```sh
$ DEBUG=kvs-m node yourApp.js 
```

## License

[MIT License](http://www.opensource.org/licenses/mit-license.php)

