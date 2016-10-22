function Storage(){}

Storage.configure = function(details) {
    if (!chrome || !chrome.storage) {
        throw new Error("The chrome.storage object is not available.");
    }
    if (Storage._configured || Storage._loadingFlag || Storage._loaded) {
        throw new Error("Storage can only be configured once and must be configured before the load method is called.");
    }
    Storage._configured = true;
    var scope = details.scope;
    if (scope) {
        if (!/^(sync|local)$/.test(scope)) {
            throw new Error("Invalid scope. Must be \"local\" or \"sync\"");
        }
        Storage._scope = scope;
    }
}

Storage.load = function(callback) {
    if (callback) {
        Storage._loadingQue.push(callback);
    }
    if (Storage._loadingFlag) {
        return;
    }
    Storage._loadingFlag = true;
    Storage._do("get", [null, function(e) {
        Storage._snapshot = e;
        Storage._loadingFlag = false;
        Storage._loaded = true;
        for (var i in Storage._loadingQue) {
            Storage._loadingQue[i](e);
        }
        Storage._loadingQue = [];
        chrome.storage.onChanged.addListener(Storage._onChanged);
    }]);
}

Storage._snapshot = {};
Storage._scope = "local";
Storage._loaded = false;
Storage._loadingFlag = false;
Storage._loadingQue = [];
Storage._configured = false;
Storage._debounceQue = [];
Storage._debounceTimer = null;

Storage._onChanged = function(properties, scope) {
    if (scope !== Storage._scope) {
        return;
    }
    for (var i in properties) {
        Storage._snapshot[i] = properties[i].newValue;
    }
}

Storage._do = function(method, args) {
    Storage._debounceMethod(function() {
        chrome.storage[Storage._scope][method].apply(chrome.storage[Storage._scope], args);
    });
}

Storage._debounceMethod = function(method) {
    Storage._debounceQue.push(method);
    Storage._debounceTimer = clearTimeout(Storage._debounceTimer);
    Storage._debounceTimer = setTimeout(Storage._onDebounceTimer.bind(Storage));
}

Storage._onDebounceTimer = function() {
    var copy = [];
    for (var i in Storage._debounceQue) {
        copy.push(Storage._debounceQue[i]);
    }
    Storage._debounceQue = [];
    Storage._debounceTimer = null;
    for (var i in copy) {
        copy[i]();
    }
}

Storage.get = function(key, defaultValue) {
    if (!Storage._loaded) {
        throw new Error("Storage.load must be called before you can access this method.");
    }
    if (key === undefined || key === null) {
        return Storage._snapshot;
    }
    else if (typeof(key) === "object") {
        var obj = {};
        if (key.constructor === Array) {
            for (var i in key) {
                obj[key[i]] = true;
            }
        }
        else {
            for (var i in key) {
                obj[i] = true;
            }
        }
        for (var i in obj) {
            obj[i] = Storage._snapshot[i];
        }
        return obj;
    }
    else {
        var value = Storage._snapshot[key];
        return value === undefined ? defaultValue : value;
    }
}

Storage.set = function(key, value, callback) {
    if (!Storage._loaded) {
        throw new Error("Storage.load must be called before you can access this method.");
    }
    var obj = {};
    if (typeof(key) === "object") {
        obj = key;
        callback = value;
    }
    else {
        obj[key] = value;
    }
    var removes = {};
    var sets = {};
    var hasRemoves = false;
    var hasSets = false;
    for (var i in obj) {
        if (obj[i] === undefined || obj[i] === null) {
            removes[i] = obj[i];
            hasRemoves = true;
            delete Storage._local[i];
        
        }
        else {
            sets[i] = obj[i];
            hasSets = true;
            Storage._snapshot[i] = obj[i];
        }
    }
    if (hasRemoves) {
        Storage._do("remove", [removes]);
    }
    if (hasSets) {
        Storage._do("set", [sets, callback]);
    }
    else if (callback) {
        callback();
    }
}

Storage.remove = function(key) {
    if (!Storage._loaded) {
        throw new Error("Storage.load must be called before you can access this method.");
    }
    var keys = typeof(key) === "object" ? key : [key];
    var obj = {};
    for (var i in keys) {
        obj[keys[i]] = undefined;
    }
    Storage.set(obj);
}

Storage.clear = function(callback) {
    if (!Storage._loaded) {
        throw new Error("Storage.load must be called before you can access this method.");
    }
    Storage._snapshot = {};
    Storage._do("clear", [callback]);
}