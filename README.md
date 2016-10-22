# Description
Helper class for the [Chrome Storage API](https://developer.chrome.com/extensions/storage).

# Installation
This package is publicly available through npm ([chrome-storage](http://npmjs.com/chrome-storage)).
Navigate to the root of your project directory and run:
```node
npm install chrome-storage
```

# Usage
```javascript
var Storage = require("./index.js");

// optionally set storage configuration
Storage.configure({
    scope: "sync", // or "local"
});

// load the existing storage into memory
Storage.load(function() {
    // set a storage key
    Storage.set("installtime", Date.now());
    // set storage keys
    Storage.set({
        installtime: Date.now(),
        type: "referral",
    });
    // get a storage key
    Storage.get("installtime", 0); // outputs key's value or 0 if undefined
    // get storage keys
    Storage.get(["installtime", "type"]); // outputs an object of key/values
    // clear some keys from storage
    Storage.remove(["installtime", "otherkey"]);
    // clear all storage
    Storage.clear();
});
```