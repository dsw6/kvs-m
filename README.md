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

### **<span style="color:blue">Item Types<span>**  
When items are added to the store, an item type can be specified.  If not specified, the volatile type is used.

- kvs.TYPE.PERM - permanent item, never removed due to inactivity
- kvs.TYPE.VOLATILE - volatile item, actively removed due to inactivity

### **<span style="color:blue">store.insert(key, value, [type])<span>**  
Adds an item to the store.  If an item with the key already exists in the store, the add operation fails.  If the store is at max size, an error is returned.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

var err = store.insert("key1", "value1", kvs.TYPE.VOLATILE);

   // error, item already exists
err = store.insert("key1", "value2", kvs.TYPE.VOLATILE);
```

### **<span style="color:blue">store.upsert(key, value, [type])<span>**  
Adds/replaces an item to the store.  If an item with the key already exists in the store, the item is replaced.  If an item does not already exist, the item is added.  If the store is at max size, an error is returned.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

var err = store.insert("key1", "value1", kvs.TYPE.PERM);

   // no error, item replaced
err = store.upsert("key1", "value2");
```

### **<span style="color:blue">store.get(key)<span>**  
Returns the store item identified by the key.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

var err = store.insert("key1", "value1", kvs.TYPE.PERM);
var item = store.get("key1");  // item = "value1"
```

### **<span style="color:blue">store.del(key)<span>**  
Deletes the store item identified by the key.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

var err = store.insert("key1", "value1", kvs.TYPE.PERM);
err = store.del("key1");
```

### **<span style="color:blue">store.clear()<span>**  
Removes all items in the store.  Items with a type of **"kvs.TYPE.PERM"** are not removed.

```javascript
const kvs = require('kvs-m');
const store = kvs({name: "myStore", maxSize: 500, itemTTL: 20000});

var err = store.insert("key1", "value1", kvs.TYPE.VOLATILE);
var err = store.insert("key2", "value2", kvs.TYPE.PERM);
err = store.clear();
   // "key2" still exists in the store
```

### **<span style="color:blue">store.metrics()<span>**  
The store collects metrics on store size and operation.  The operation metrics are reset each time the metrics are queried.

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

The package uses the debug prefix `kvs-m`.  To enable the debug messages for all components, use the wildcard format when setting the DEBUG environment constiable:

```sh
$ DEBUG=kvs-m node yourApp.js 
```

## License

[MIT License](http://www.opensource.org/licenses/mit-license.php)

