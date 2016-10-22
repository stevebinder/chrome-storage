var Storage = require("./index.js");

// set storage configuration
Storage.configure({
    store: "sync", // or "local"
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