/**
 * Android WebView Polyfills
 * This file provides polyfills for modern JavaScript features that may not be supported
 * in older Android WebView versions.
 */

// Promise polyfill for older Android WebView versions
if (typeof Promise === 'undefined') {
    // Load Promise polyfill if needed
    console.warn('Promise not supported, loading polyfill...');
}

// Async/Await polyfill using regenerator-runtime
if (typeof window !== 'undefined' && !window.regeneratorRuntime) {
    try {
        require('regenerator-runtime/runtime');
    } catch (e) {
        console.warn('Could not load regenerator-runtime:', e);
    }
}

// Array polyfills
if (!Array.prototype.find) {
    Array.prototype.find = function(predicate) {
        if (this == null) {
            throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
            throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = parseInt(list.length) || 0;
        var thisArg = arguments[1];
        for (var i = 0; i < length; i++) {
            var element = list[i];
            if (predicate.call(thisArg, element, i, list)) {
                return element;
            }
        }
        return undefined;
    };
}

if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {
        if (this == null) {
            throw new TypeError('Array.prototype.includes called on null or undefined');
        }
        var O = Object(this);
        var len = parseInt(O.length) || 0;
        if (len === 0) {
            return false;
        }
        var n = parseInt(fromIndex) || 0;
        var k;
        if (n >= 0) {
            k = n;
        } else {
            k = len + n;
            if (k < 0) {
                k = 0;
            }
        }
        var currentElement;
        while (k < len) {
            currentElement = O[k];
            if (searchElement === currentElement || (searchElement !== searchElement && currentElement !== currentElement)) {
                return true;
            }
            k++;
        }
        return false;
    };
}

// String polyfills
if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
            start = 0;
        }
        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(searchString, length) {
        if (length === undefined || length > this.length) {
            length = this.length;
        }
        return this.substring(length - searchString.length, length) === searchString;
    };
}

// Object.assign polyfill
if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
        if (target == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var to = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var nextSource = arguments[index];
            if (nextSource != null) {
                for (var nextKey in nextSource) {
                    if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
        }
        return to;
    };
}

// Fetch polyfill for older Android WebView
if (typeof fetch === 'undefined') {
    console.warn('Fetch not supported, consider using XMLHttpRequest or a fetch polyfill');
}

// Console.log polyfill for very old Android WebView versions
if (typeof console === 'undefined') {
    window.console = {
        log: function() {},
        warn: function() {},
        error: function() {},
        info: function() {},
        debug: function() {}
    };
}

// LocalStorage polyfill for older Android WebView
if (typeof localStorage === 'undefined') {
    console.warn('localStorage not supported, using fallback');
    window.localStorage = {
        _data: {},
        setItem: function(id, val) {
            this._data[id] = String(val);
        },
        getItem: function(id) {
            return this._data.hasOwnProperty(id) ? this._data[id] : null;
        },
        removeItem: function(id) {
            delete this._data[id];
        },
        clear: function() {
            this._data = {};
        }
    };
}

console.log('Android WebView polyfills loaded successfully'); 