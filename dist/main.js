(function () {
  'use strict';

  var babelHelpers = {};
  babelHelpers.typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  babelHelpers.classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  babelHelpers.createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  babelHelpers.get = function get(object, property, receiver) {
    if (object === null) object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        return get(parent, property, receiver);
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  };

  babelHelpers.inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  babelHelpers.possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  babelHelpers.slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  babelHelpers.toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  babelHelpers;


  var __commonjs_global = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
  function __commonjs(fn, module) { return module = { exports: {} }, fn(module, module.exports, __commonjs_global), module.exports; }

  function escape(html) {
      var escaped = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&apos;"
      };
      return String(html).replace(/[&<>"\']/g, function (character) {
          var _ref;
          return (_ref = escaped[character]) != null ? _ref : character;
      });
  }

  function stripColorCodes(html) {
      return html.replace(/\u0003\d{1,2}(,\d{1,2})?/g, "").replace(/[\x0F\x02\x1F\x1D]/g, "");
  }

  /**
   * Somewhat naive implementation of parsing color codes that does not respect
   * proper order of HTML open and close tags. Chrome doesn't seem to mind, though.
   */
  function parseColorCodes(html) {
      var colors = ["rgb(255, 255, 255)", "rgb(0, 0, 0)", "rgb(0, 0, 128)", "rgb(0, 128, 0)", "rgb(255, 0, 0)", "rgb(128, 0, 64)", "rgb(128, 0, 128)", "rgb(255, 128, 64)", "rgb(255, 255, 0)", "rgb(128, 255, 0)", "rgb(0, 128, 128)", "rgb(0, 255, 255)", "rgb(0, 0, 255)", "rgb(255, 0, 255)", "rgb(128, 128, 128)", "rgb(192, 192, 192)"];

      var color = null,
          background = null,
          bold = false,
          italics = false,
          underline = false;

      var res = html.replace(/(\x0F|\x02|\x1F|\x1D|\u0003(\d{0,2})(?:,(\d{1,2}))?)([^\x0F\x02\x1F\x1D\u0003]*)/g, function (match, gr1, gr2, gr3, gr4) {
          if (gr1 == "\x0F") {
              color = null;
              background = null;
              bold = false;
              italics = false;
              underline = false;
          } else if (gr1 == "\x02") {
              bold = !bold;
          } else if (gr1 == "\x1F") {
              underline = !underline;
          } else if (gr1 == "\x1D") {
              italics = !italics;
          } else {
              if (gr2) color = colors[parseInt(gr2)];

              if (gr3) background = colors[parseInt(gr3)];
          }

          if (!gr4) return "";

          return "<font style='" + (color ? "color: " + color + ";" : "") + (background ? "background-color: " + background + ";" : "") + (bold ? "font-weight: bold;" : "") + (underline ? "text-decoration: underline;" : "") + (italics ? "font-style: italic;" : "") + "'>" + gr4 + "</font>";
      });

      return res;
  }

  function _display(text, allowHtml, regx) {
      var canonicalise, innerEscape, res, textIndex;
      var escapeHTML = escape;

      canonicalise = function canonicalise(url) {
          url = stripColorCodes(url);
          url = escapeHTML(url);
          if (url.match(/^[a-z][\w-]+:/i)) {
              return url;
          } else {
              return "http://" + url;
          }
      };

      innerEscape = function innerEscape(str) {
          if (allowHtml) return str;
          // long words need to be extracted before escaping so escape HTML characters
          // don't scew the word length
          var longWords = (str.match(/\S{40,}/g) || []).map(function (word) {
              return escapeHTML(word);
          });

          str = escapeHTML(str);

          return longWords.reduce(function (result, word) {
              var replacement = void 0,
                  n = void 0;
              replacement = "<span class=\"longword\">" + word + "</span>";
              str = str.replace(word, replacement);
              n = str.indexOf(replacement) + replacement.length;
              result += str.slice(0, +(n - 1) + 1 || 9e9);
              str = str.slice(n);
              return result;
          }, "") + str;
      };

      res = "";
      textIndex = 0;
      for (var m = regx.exec(text); m; m = regx.exec(text)) {
          res += innerEscape(text.substr(textIndex, m.index - textIndex));
          res += "<a target=\"_blank\" href=\"" + canonicalise(m[0]) + "\">" + escape(m[0]) + "</a>";
          textIndex = m.index + m[0].length;
      }
      res += innerEscape(text.substr(textIndex));
      res = parseColorCodes(res);

      return res;
  }

  function makeDisplay(rurl) {
      return function (text, allowHtml) {
          return _display(text, allowHtml, rurl);
      };
  }

  /**
   * Escapes HTML and linkifies
   */
  var display = makeDisplay(/\b(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gi);

var HTMLUtils = Object.freeze({
      escape: escape,
      stripColorCodes: stripColorCodes,
      parseColorCodes: parseColorCodes,
      _display: _display,
      display: display
  });

  var html = HTMLUtils;
  var loggingEnabled = false;
  var storedLogs = [];
  var MAX_NUM_STORED_LOGS = 400;

  function getLoggerForType(type) {
      switch (type) {
          case "w":
              // warning
              return function () {
                  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                      args[_key] = arguments[_key];
                  }

                  if (args.length < 1) return;
                  if (loggingEnabled) console.warn.apply(console, args);else storeLog("warn", args);
              };
          case "e":
              // error
              return function () {
                  var _console;

                  if (arguments.length < 1) return;
                  (_console = console).error.apply(_console, arguments);
              };
          default:
              // info
              return function () {
                  var _console2;

                  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      args[_key2] = arguments[_key2];
                  }

                  if (args.length < 1) return;
                  if (loggingEnabled) (_console2 = console).log.apply(_console2, args);else storeLog("log", args);
              };
      }
  }

  /**
   * @param  {any} obj Object to traverse
   * @param  {Array} fieldPath Array of fields to traverse in order
   * @return {any or null} Returns the last field if it exists, or null if it doesn't
   */
  function getFieldOrNull(obj, fieldPath) {
      return fieldPath.reduce(function (o, field) {
          if (o === undefined || o === null) return null;
          return o[field];
      }, obj);
  }

  function assert(cond) {
      if (!cond) {
          throw new Error("assertion failed");
      }
  }

  function getLogger(caller) {
      return function () {
          for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
          }

          var type,
              opt_type = args[0],
              msg = 2 <= args.length ? args.slice(1) : [];

          if (opt_type === "l" || opt_type === "w" || opt_type === "e") {
              type = opt_type;
          } else {
              msg = [opt_type].concat(msg);
          }
          return getLoggerForType(type).apply(null, [caller.constructor.name + ":"].concat(babelHelpers.toConsumableArray(msg)));
      };
  }

  function enableLogging() {
      loggingEnabled = true;
      // Display the last 300-400 logs.
      storedLogs.forEach(function (log) {
          return console[log.type].apply(console, log.msg);
      });
      console.log("---------------------------------------------------");
      console.log("DEBUG: printed the last " + storedLogs.length + " logs.");
      console.log("---------------------------------------------------");
  }
  /**
   * @param  {string} word
   * @param  {number} num
   */
  function pluralize(word, num) {
      if (!word || num === 1) {
          return word;
      }
      if (word[word.length - 1] === "s") {
          return word + "es";
      } else {
          return word + "s";
      }
  }

  function storeLog(type, msg) {
      storedLogs.push({ type: type, msg: msg });
      if (storedLogs.length > MAX_NUM_STORED_LOGS) {
          storedLogs = storedLogs.slice(100);
      }
  }

  /**
   * Download an asset at the given URL and a return a local url to it that can be
   *  embeded in CIRC. A remote asset can not be directly embeded because of
   *  packaged apps content security policy.
   * @param {string} url
   * @param {function(string)} onload The callback which is passed the new url
   */
  function getEmbedableUrl(url, onload) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.onload = function onXHRLoad() {
          return onload(window.URL.createObjectURL(this.response));
      };
      xhr.onerror = function () {
          var _console3;

          for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args[_key4] = arguments[_key4];
          }

          return (_console3 = console).error.apply(_console3, ["Failed to get embedable url for asset:", url].concat(args));
      };
      return xhr.send();
  }

  /**
   * Returns a human readable representation of a list.
   * For example, [1, 2, 3] becomes "1, 2 and 3".
   * @param {Array<Object>} array
   * @return {string} readable list
   */
  function getReadableList(array) {
      if (array.size() === 1) {
          return array.first().toString();
      } else {
          return array.initial().join(", ") + " and " + array.last();
      }
  }

  function getReadableTime(epochMilliseconds) {
      var date = new Date();
      //The time coming from the server here is actually epoc time, so we need to set it accordingly.
      date.setTime(epochMilliseconds);
      return date.toString();
  }

  function isOnline() {
      return window.navigator.onLine;
  }

  function removeFromArray(array, toRemove) {
      var i = array.indexOf(toRemove);
      if (i < 0) {
          return false;
      }
      return array.splice(i, 1);
  }

  function truncateIfTooLarge(text, maxSize, suffix) {
      if (suffix == null) {
          suffix = "...";
      }
      if (text.length > maxSize) {
          return text.slice(0, +(maxSize - suffix.length - 1) + 1 || 9e9) + suffix;
      } else {
          return text;
      }
  }

  /**
   * Capitalizes the given string.
   * @param {string} sentence
   * @return {string} upper case string
   */
  function capitalizeString(sentence) {
      if (!sentence) return sentence;
      return sentence[0].toUpperCase() + sentence.slice(1);
  }

  /**
   * Returns whether or not the given string has non-whitespace characters.
   * @param {string} phrase
   * @return {boolean} result
   */
  function stringHasContent(phrase) {
      if (!phrase) return false;
      return (/\S/.test(phrase)
      );
  }

  /**
   * Opens a file browser and returns the contents of the selected file.
   * @param {function(string)} callback The function to call after the file content has be retrieved.
   */
  function loadFromFileSystem(callback) {
      return chrome.fileSystem.chooseFile({
          type: "openFile"
      }, function (fileEntry) {
          if (!fileEntry) {
              return;
          }
          return fileEntry.file(function (file) {
              var fileReader;
              fileReader = new FileReader();
              fileReader.onload = function (e) {
                  return callback(e.target.result);
              };
              fileReader.onerror = function (e) {
                  return console.error("Read failed:", e);
              };
              return fileReader.readAsText(file);
          });
      });
  }

  function registerSocketConnection(socketId, remove) {
      if (window.chrome && chrome.runtime) {
          chrome.runtime.getBackgroundPage(function (page) {
              if (!page || !page.registerSocketId || !page.unregisterSocketId) return;
              if (remove) page.unregisterSocketId(socketId);else page.registerSocketId(socketId);
          });
      }
  }

  function registerTcpServer(socketId, remove) {
      if (window.chrome && chrome.runtime) {
          chrome.runtime.getBackgroundPage(function (page) {
              if (!page || !page.registerTcpServer || !page.unregisterTcpServer) return;
              if (remove) page.unregisterTcpServer(socketId);else page.registerTcpServer(socketId);
          });
      }
  }

  /**
   * Manages the sending and receiving of events.
   */

  var EventEmitter = function () {
      function EventEmitter() {
          babelHelpers.classCallCheck(this, EventEmitter);

          this._log = getLogger(this);
          this._listeners = {};
          this._anyEventListeners = [];
      }
      /**
       * Registers a callback to be invoked upon any event emission
       * @param  {function} callback
       */


      babelHelpers.createClass(EventEmitter, [{
          key: "onAny",
          value: function onAny(callback) {
              return this._anyEventListeners.push(callback);
          }
          /**
           * Registers a callback to be invoked upon a specific event emission
           * @param  {string} ev
           * @param  {function} callback
           */

      }, {
          key: "on",
          value: function on(ev, callback) {
              var base, ref;
              return ((ref = (base = this._listeners)[ev]) != null ? ref : base[ev] = []).push(callback);
          }
          /**
           * Calls listeners for the supplied event, plus all "any" listeners
           * @param  {string} ev
           * @param  {any} ...data
           * @return {Array} Results of "any" listeners
           */

      }, {
          key: "emit",
          value: function emit(ev) {
              for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  data[_key - 1] = arguments[_key];
              }

              var anyListenersArray = this._anyEventListeners,
                  listenersArray = this._listeners[ev] || [];

              listenersArray.forEach(function (listener) {
                  return listener.apply(null, data);
              });
              return anyListenersArray.map(function (listener) {
                  return listener.apply(null, [ev].concat(data));
              });
          }
          /**
           * Registers a callback to be invoked only once upon a specific event emission
           * @param  {string} ev
           * @param  {function} callback
           */

      }, {
          key: "once",
          value: function once(ev, callback) {
              var _this = this;

              var f = function f() {
                  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      args[_key2] = arguments[_key2];
                  }

                  _this.removeListener(ev, f);
                  return callback.apply.apply(callback, [null].concat(args));
              };
              this.on(ev, f);
              return f.listener = callback;
          }
          /**
           * Removes a specific supplied callback from a list of event listeners
           * @param  {string} ev
           * @param  {function} callbackToRemove
           * @return {Array} listeners
           */

      }, {
          key: "removeListener",
          value: function removeListener(ev, callbackToRemove) {
              if (!(this._listeners && this._listeners[ev] && callbackToRemove != null)) {
                  return;
              }

              this._listeners[ev] = this._listeners[ev].filter(function (listener) {
                  return listener !== callbackToRemove;
              });

              return this._listeners[ev];
          }
      }]);
      return EventEmitter;
  }();

  var lazy = __commonjs(function (module, exports, global) {
  /*
   * @name Lazy.js
   *
   * @fileOverview
   * Lazy.js is a lazy evaluation library for JavaScript.
   *
   * This has been done before. For examples see:
   *
   * - [wu.js](http://fitzgen.github.io/wu.js/)
   * - [Linq.js](http://linqjs.codeplex.com/)
   * - [from.js](https://github.com/suckgamoni/fromjs/)
   * - [IxJS](http://rx.codeplex.com/)
   * - [sloth.js](http://rfw.name/sloth.js/)
   *
   * However, at least at present, Lazy.js is faster (on average) than any of
   * those libraries. It is also more complete, with nearly all of the
   * functionality of [Underscore](http://underscorejs.org/) and
   * [Lo-Dash](http://lodash.com/).
   *
   * Finding your way around the code
   * --------------------------------
   *
   * At the heart of Lazy.js is the {@link Sequence} object. You create an initial
   * sequence using {@link Lazy}, which can accept an array, object, or string.
   * You can then "chain" together methods from this sequence, creating a new
   * sequence with each call.
   *
   * Here's an example:
   *
   *     var data = getReallyBigArray();
   *
   *     var statistics = Lazy(data)
   *       .map(transform)
   *       .filter(validate)
   *       .reduce(aggregate);
   *
   * {@link Sequence} is the foundation of other, more specific sequence types.
   *
   * An {@link ArrayLikeSequence} provides indexed access to its elements.
   *
   * An {@link ObjectLikeSequence} consists of key/value pairs.
   *
   * A {@link StringLikeSequence} is like a string (duh): actually, it is an
   * {@link ArrayLikeSequence} whose elements happen to be characters.
   *
   * An {@link AsyncSequence} is special: it iterates over its elements
   * asynchronously (so calling `each` generally begins an asynchronous loop and
   * returns immediately).
   *
   * For more information
   * --------------------
   *
   * I wrote a blog post that explains a little bit more about Lazy.js, which you
   * can read [here](http://philosopherdeveloper.com/posts/introducing-lazy-js.html).
   *
   * You can also [create an issue on GitHub](https://github.com/dtao/lazy.js/issues)
   * if you have any issues with the library. I work through them eventually.
   *
   * [@dtao](https://github.com/dtao)
   */

  (function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      define(factory);
    } else if (typeof exports === 'object') {
      module.exports = factory();
    } else {
      root.Lazy = factory();
    }
  })(__commonjs_global, function(context) {
    /**
     * Wraps an object and returns a {@link Sequence}. For `null` or `undefined`,
     * simply returns an empty sequence (see {@link Lazy.strict} for a stricter
     * implementation).
     *
     * - For **arrays**, Lazy will create a sequence comprising the elements in
     *   the array (an {@link ArrayLikeSequence}).
     * - For **objects**, Lazy will create a sequence of key/value pairs
     *   (an {@link ObjectLikeSequence}).
     * - For **strings**, Lazy will create a sequence of characters (a
     *   {@link StringLikeSequence}).
     *
     * @public
     * @param {Array|Object|string} source An array, object, or string to wrap.
     * @returns {Sequence} The wrapped lazy object.
     *
     * @exampleHelpers
     * // Utility functions to provide to all examples
     * function increment(x) { return x + 1; }
     * function isEven(x) { return x % 2 === 0; }
     * function isPositive(x) { return x > 0; }
     * function isNegative(x) { return x < 0; }
     *
     * @examples
     * Lazy([1, 2, 4])       // instanceof Lazy.ArrayLikeSequence
     * Lazy({ foo: "bar" })  // instanceof Lazy.ObjectLikeSequence
     * Lazy("hello, world!") // instanceof Lazy.StringLikeSequence
     * Lazy()                // sequence: []
     * Lazy(null)            // sequence: []
     */
    function Lazy(source) {
      if (source instanceof Array) {
        return new ArrayWrapper(source);

      } else if (typeof source === "string") {
        return new StringWrapper(source);

      } else if (source instanceof Sequence) {
        return source;
      }

      if (Lazy.extensions) {
        var extensions = Lazy.extensions, length = extensions.length, result;
        while (!result && length--) {
          result = extensions[length](source);
        }
        if (result) {
          return result;
        }
      }

      return new ObjectWrapper(source);
    }

    Lazy.VERSION = '0.4.2';

    /*** Utility methods of questionable value ***/

    Lazy.noop = function noop() {};
    Lazy.identity = function identity(x) { return x; };

    /**
     * Provides a stricter version of {@link Lazy} which throws an error when
     * attempting to wrap `null`, `undefined`, or numeric or boolean values as a
     * sequence.
     *
     * @public
     * @returns {Function} A stricter version of the {@link Lazy} helper function.
     *
     * @examples
     * var Strict = Lazy.strict();
     *
     * Strict()                  // throws
     * Strict(null)              // throws
     * Strict(true)              // throws
     * Strict(5)                 // throws
     * Strict([1, 2, 3])         // instanceof Lazy.ArrayLikeSequence
     * Strict({ foo: "bar" })    // instanceof Lazy.ObjectLikeSequence
     * Strict("hello, world!")   // instanceof Lazy.StringLikeSequence
     *
     * // Let's also ensure the static functions are still there.
     * Strict.range(3)           // sequence: [0, 1, 2]
     * Strict.generate(Date.now) // instanceof Lazy.GeneratedSequence
     */
    Lazy.strict = function strict() {
      function StrictLazy(source) {
        if (source == null) {
          throw new Error("You cannot wrap null or undefined using Lazy.");
        }

        if (typeof source === "number" || typeof source === "boolean") {
          throw new Error("You cannot wrap primitive values using Lazy.");
        }

        return Lazy(source);
      };

      Lazy(Lazy).each(function(property, name) {
        StrictLazy[name] = property;
      });

      return StrictLazy;
    };

    /**
     * The `Sequence` object provides a unified API encapsulating the notion of
     * zero or more consecutive elements in a collection, stream, etc.
     *
     * Lazy evaluation
     * ---------------
     *
     * Generally speaking, creating a sequence should not be an expensive operation,
     * and should not iterate over an underlying source or trigger any side effects.
     * This means that chaining together methods that return sequences incurs only
     * the cost of creating the `Sequence` objects themselves and not the cost of
     * iterating an underlying data source multiple times.
     *
     * The following code, for example, creates 4 sequences and does nothing with
     * `source`:
     *
     *     var seq = Lazy(source) // 1st sequence
     *       .map(func)           // 2nd
     *       .filter(pred)        // 3rd
     *       .reverse();          // 4th
     *
     * Lazy's convention is to hold off on iterating or otherwise *doing* anything
     * (aside from creating `Sequence` objects) until you call `each`:
     *
     *     seq.each(function(x) { console.log(x); });
     *
     * Defining custom sequences
     * -------------------------
     *
     * Defining your own type of sequence is relatively simple:
     *
     * 1. Pass a *method name* and an object containing *function overrides* to
     *    {@link Sequence.define}. If the object includes a function called `init`,
     *    this function will be called upon initialization.
     * 2. The object should include at least either a `getIterator` method or an
     *    `each` method. The former supports both asynchronous and synchronous
     *    iteration, but is slightly more cumbersome to implement. The latter
     *    supports synchronous iteration and can be automatically implemented in
     *    terms of the former. You can also implement both if you want, e.g. to
     *    optimize performance. For more info, see {@link Iterator} and
     *    {@link AsyncSequence}.
     *
     * As a trivial example, the following code defines a new method, `sample`,
     * which randomly may or may not include each element from its parent.
     *
     *     Lazy.Sequence.define("sample", {
     *       each: function(fn) {
     *         return this.parent.each(function(e) {
     *           // 50/50 chance of including this element.
     *           if (Math.random() > 0.5) {
     *             return fn(e);
     *           }
     *         });
     *       }
     *     });
     *
     * (Of course, the above could also easily have been implemented using
     * {@link #filter} instead of creating a custom sequence. But I *did* say this
     * was a trivial example, to be fair.)
     *
     * Now it will be possible to create this type of sequence from any parent
     * sequence by calling the method name you specified. In other words, you can
     * now do this:
     *
     *     Lazy(arr).sample();
     *     Lazy(arr).map(func).sample();
     *     Lazy(arr).map(func).filter(pred).sample();
     *
     * Etc., etc.
     *
     * @public
     * @constructor
     */
    function Sequence() {}

    /**
     * Create a new constructor function for a type inheriting from `Sequence`.
     *
     * @public
     * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
     *     used for constructing the new sequence. The method will be attached to
     *     the `Sequence` prototype so that it can be chained with any other
     *     sequence methods, like {@link #map}, {@link #filter}, etc.
     * @param {Object} overrides An object containing function overrides for this
     *     new sequence type. **Must** include either `getIterator` or `each` (or
     *     both). *May* include an `init` method as well. For these overrides,
     *     `this` will be the new sequence, and `this.parent` will be the base
     *     sequence from which the new sequence was constructed.
     * @returns {Function} A constructor for a new type inheriting from `Sequence`.
     *
     * @examples
     * // This sequence type logs every element to the specified logger as it
     * // iterates over it.
     * Lazy.Sequence.define("verbose", {
     *   init: function(logger) {
     *     this.logger = logger;
     *   },
     *
     *   each: function(fn) {
     *     var logger = this.logger;
     *     return this.parent.each(function(e, i) {
     *       logger(e);
     *       return fn(e, i);
     *     });
     *   }
     * });
     *
     * Lazy([1, 2, 3]).verbose(logger).each(Lazy.noop) // calls logger 3 times
     */
    Sequence.define = function define(methodName, overrides) {
      if (!overrides || (!overrides.getIterator && !overrides.each)) {
        throw new Error("A custom sequence must implement *at least* getIterator or each!");
      }

      return defineSequenceType(Sequence, methodName, overrides);
    };

    /**
     * Gets the number of elements in the sequence. In some cases, this may
     * require eagerly evaluating the sequence.
     *
     * @public
     * @returns {number} The number of elements in the sequence.
     *
     * @examples
     * Lazy([1, 2, 3]).size();                 // => 3
     * Lazy([1, 2]).map(Lazy.identity).size(); // => 2
     * Lazy([1, 2, 3]).reject(isEven).size();  // => 2
     * Lazy([1, 2, 3]).take(1).size();         // => 1
     * Lazy({ foo: 1, bar: 2 }).size();        // => 2
     * Lazy('hello').size();                   // => 5
     */
    Sequence.prototype.size = function size() {
      return this.getIndex().length();
    };

    /**
     * Creates an {@link Iterator} object with two methods, `moveNext` -- returning
     * true or false -- and `current` -- returning the current value.
     *
     * This method is used when asynchronously iterating over sequences. Any type
     * inheriting from `Sequence` must implement this method or it can't support
     * asynchronous iteration.
     *
     * Note that **this method is not intended to be used directly by application
     * code.** Rather, it is intended as a means for implementors to potentially
     * define custom sequence types that support either synchronous or
     * asynchronous iteration.
     *
     * @public
     * @returns {Iterator} An iterator object.
     *
     * @examples
     * var iterator = Lazy([1, 2]).getIterator();
     *
     * iterator.moveNext(); // => true
     * iterator.current();  // => 1
     * iterator.moveNext(); // => true
     * iterator.current();  // => 2
     * iterator.moveNext(); // => false
     */
    Sequence.prototype.getIterator = function getIterator() {
      return new Iterator(this);
    };

    /**
     * Gets the root sequence underlying the current chain of sequences.
     */
    Sequence.prototype.root = function root() {
      return this.parent.root();
    };

    /**
     * Whether or not the current sequence is an asynchronous one. This is more
     * accurate than checking `instanceof {@link AsyncSequence}` because, for
     * example, `Lazy([1, 2, 3]).async().map(Lazy.identity)` returns a sequence
     * that iterates asynchronously even though it's not an instance of
     * `AsyncSequence`.
     *
     * @returns {boolean} Whether or not the current sequence is an asynchronous one.
     */
    Sequence.prototype.isAsync = function isAsync() {
      return this.parent ? this.parent.isAsync() : false;
    };

    /**
     * Evaluates the sequence and produces the appropriate value (an array in most
     * cases, an object for {@link ObjectLikeSequence}s or a string for
     * {@link StringLikeSequence}s).
     *
     * @returns {Array|string|Object} The value resulting from fully evaluating
     *     the sequence.
     */
    Sequence.prototype.value = function value() {
      return this.toArray();
    };

    /**
     * Applies the current transformation chain to a given source, returning the
     * resulting value.
     *
     * @examples
     * var sequence = Lazy([])
     *   .map(function(x) { return x * -1; })
     *   .filter(function(x) { return x % 2 === 0; });
     *
     * sequence.apply([1, 2, 3, 4]); // => [-2, -4]
     */
    Sequence.prototype.apply = function apply(source) {
      var root = this.root(),
          previousSource = root.source,
          result;

      try {
        root.source = source;
        result = this.value();
      } finally {
        root.source = previousSource;
      }

      return result;
    };

    /**
     * The Iterator object provides an API for iterating over a sequence.
     *
     * The purpose of the `Iterator` type is mainly to offer an agnostic way of
     * iterating over a sequence -- either synchronous (i.e. with a `while` loop)
     * or asynchronously (with recursive calls to either `setTimeout` or --- if
     * available --- `setImmediate`). It is not intended to be used directly by
     * application code.
     *
     * @public
     * @constructor
     * @param {Sequence} sequence The sequence to iterate over.
     */
    function Iterator(sequence) {
      this.sequence = sequence;
      this.index    = -1;
    }

    /**
     * Gets the current item this iterator is pointing to.
     *
     * @public
     * @returns {*} The current item.
     */
    Iterator.prototype.current = function current() {
      return this.cachedIndex && this.cachedIndex.get(this.index);
    };

    /**
     * Moves the iterator to the next item in a sequence, if possible.
     *
     * @public
     * @returns {boolean} True if the iterator is able to move to a new item, or else
     *     false.
     */
    Iterator.prototype.moveNext = function moveNext() {
      var cachedIndex = this.cachedIndex;

      if (!cachedIndex) {
        cachedIndex = this.cachedIndex = this.sequence.getIndex();
      }

      if (this.index >= cachedIndex.length() - 1) {
        return false;
      }

      ++this.index;
      return true;
    };

    /**
     * Creates an array snapshot of a sequence.
     *
     * Note that for indefinite sequences, this method may raise an exception or
     * (worse) cause the environment to hang.
     *
     * @public
     * @returns {Array} An array containing the current contents of the sequence.
     *
     * @examples
     * Lazy([1, 2, 3]).toArray() // => [1, 2, 3]
     */
    Sequence.prototype.toArray = function toArray() {
      return this.reduce(function(arr, element) {
        arr.push(element);
        return arr;
      }, []);
    };

    /**
     * Provides an indexed view into the sequence.
     *
     * For sequences that are already indexed, this will simply return the
     * sequence. For non-indexed sequences, this will eagerly evaluate the
     * sequence.
     *
     * @returns {ArrayLikeSequence} A sequence containing the current contents of
     *     the sequence.
     *
     * @examples
     * Lazy([1, 2, 3]).filter(isEven)            // instanceof Lazy.Sequence
     * Lazy([1, 2, 3]).filter(isEven).getIndex() // instanceof Lazy.ArrayLikeSequence
     */
    Sequence.prototype.getIndex = function getIndex() {
      return new ArrayWrapper(this.toArray());
    };

    /**
     * Returns the element at the specified index. Note that, for sequences that
     * are not {@link ArrayLikeSequence}s, this may require partially evaluating
     * the sequence, iterating to reach the result. (In other words for such
     * sequences this method is not O(1).)
     *
     * @public
     * @param {number} i The index to access.
     * @returns {*} The element.
     *
     */
    Sequence.prototype.get = function get(i) {
      var element;
      this.each(function(e, index) {
        if (index === i) {
          element = e;
          return false;
        }
      });
      return element;
    };

    /**
     * Provides an indexed, memoized view into the sequence. This will cache the
     * result whenever the sequence is first iterated, so that subsequent
     * iterations will access the same element objects.
     *
     * @public
     * @returns {ArrayLikeSequence} An indexed, memoized sequence containing this
     *     sequence's elements, cached after the first iteration.
     *
     * @example
     * function createObject() { return new Object(); }
     *
     * var plain    = Lazy.generate(createObject, 10),
     *     memoized = Lazy.generate(createObject, 10).memoize();
     *
     * plain.toArray()[0] === plain.toArray()[0];       // => false
     * memoized.toArray()[0] === memoized.toArray()[0]; // => true
     */
    Sequence.prototype.memoize = function memoize() {
      return new MemoizedSequence(this);
    };

    /**
     * @constructor
     */
    function MemoizedSequence(parent) {
      this.parent = parent;
    }

    // MemoizedSequence needs to have its prototype set up after ArrayLikeSequence

    /**
     * Creates an object from a sequence of key/value pairs.
     *
     * @public
     * @returns {Object} An object with keys and values corresponding to the pairs
     *     of elements in the sequence.
     *
     * @examples
     * var details = [
     *   ["first", "Dan"],
     *   ["last", "Tao"],
     *   ["age", 29]
     * ];
     *
     * Lazy(details).toObject() // => { first: "Dan", last: "Tao", age: 29 }
     */
    Sequence.prototype.toObject = function toObject() {
      return this.reduce(function(object, pair) {
        object[pair[0]] = pair[1];
        return object;
      }, {});
    };

    /**
     * Iterates over this sequence and executes a function for every element.
     *
     * @public
     * @aka forEach
     * @param {Function} fn The function to call on each element in the sequence.
     *     Return false from the function to end the iteration.
     * @returns {boolean} `true` if the iteration evaluated the entire sequence,
     *     or `false` if iteration was ended early.
     *
     * @examples
     * Lazy([1, 2, 3, 4]).each(fn) // calls fn 4 times
     */
    Sequence.prototype.each = function each(fn) {
      var iterator = this.getIterator(),
          i = -1;

      while (iterator.moveNext()) {
        if (fn(iterator.current(), ++i) === false) {
          return false;
        }
      }

      return true;
    };

    Sequence.prototype.forEach = function forEach(fn) {
      return this.each(fn);
    };

    /**
     * Creates a new sequence whose values are calculated by passing this sequence's
     * elements through some mapping function.
     *
     * @public
     * @aka collect
     * @param {Function} mapFn The mapping function used to project this sequence's
     *     elements onto a new sequence. This function takes up to two arguments:
     *     the element, and the current index.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * function addIndexToValue(e, i) { return e + i; }
     *
     * Lazy([]).map(increment)              // sequence: []
     * Lazy([1, 2, 3]).map(increment)       // sequence: [2, 3, 4]
     * Lazy([1, 2, 3]).map(addIndexToValue) // sequence: [1, 3, 5]
     *
     * @benchmarks
     * function increment(x) { return x + 1; }
     *
     * var smArr = Lazy.range(10).toArray(),
     *     lgArr = Lazy.range(100).toArray();
     *
     * Lazy(smArr).map(increment).each(Lazy.noop) // lazy - 10 elements
     * Lazy(lgArr).map(increment).each(Lazy.noop) // lazy - 100 elements
     * _.each(_.map(smArr, increment), _.noop)    // lodash - 10 elements
     * _.each(_.map(lgArr, increment), _.noop)    // lodash - 100 elements
     */
    Sequence.prototype.map = function map(mapFn) {
      return new MappedSequence(this, createCallback(mapFn));
    };

    Sequence.prototype.collect = function collect(mapFn) {
      return this.map(mapFn);
    };

    /**
     * @constructor
     */
    function MappedSequence(parent, mapFn) {
      this.parent = parent;
      this.mapFn  = mapFn;
    }

    MappedSequence.prototype = new Sequence();

    MappedSequence.prototype.getIterator = function getIterator() {
      return new MappingIterator(this.parent, this.mapFn);
    };

    MappedSequence.prototype.each = function each(fn) {
      var mapFn = this.mapFn;
      return this.parent.each(function(e, i) {
        return fn(mapFn(e, i), i);
      });
    };

    /**
     * @constructor
     */
    function MappingIterator(sequence, mapFn) {
      this.iterator = sequence.getIterator();
      this.mapFn    = mapFn;
      this.index    = -1;
    }

    MappingIterator.prototype.current = function current() {
      return this.mapFn(this.iterator.current(), this.index);
    };

    MappingIterator.prototype.moveNext = function moveNext() {
      if (this.iterator.moveNext()) {
        ++this.index;
        return true;
      }

      return false;
    };

    /**
     * Creates a new sequence whose values are calculated by accessing the specified
     * property from each element in this sequence.
     *
     * @public
     * @param {string} propertyName The name of the property to access for every
     *     element in this sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * var people = [
     *   { first: "Dan", last: "Tao" },
     *   { first: "Bob", last: "Smith" }
     * ];
     *
     * Lazy(people).pluck("last") // sequence: ["Tao", "Smith"]
     */
    Sequence.prototype.pluck = function pluck(property) {
      return this.map(property);
    };

    /**
     * Creates a new sequence whose values are calculated by invoking the specified
     * function on each element in this sequence.
     *
     * @public
     * @param {string} methodName The name of the method to invoke for every element
     *     in this sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * function Person(first, last) {
     *   this.fullName = function fullName() {
     *     return first + " " + last;
     *   };
     * }
     *
     * var people = [
     *   new Person("Dan", "Tao"),
     *   new Person("Bob", "Smith")
     * ];
     *
     * Lazy(people).invoke("fullName") // sequence: ["Dan Tao", "Bob Smith"]
     */
    Sequence.prototype.invoke = function invoke(methodName) {
      return this.map(function(e) {
        return e[methodName]();
      });
    };

    /**
     * Creates a new sequence whose values are the elements of this sequence which
     * satisfy the specified predicate.
     *
     * @public
     * @aka select
     * @param {Function} filterFn The predicate to call on each element in this
     *     sequence, which returns true if the element should be included.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * var numbers = [1, 2, 3, 4, 5, 6];
     *
     * Lazy(numbers).filter(isEven) // sequence: [2, 4, 6]
     *
     * @benchmarks
     * function isEven(x) { return x % 2 === 0; }
     *
     * var smArr = Lazy.range(10).toArray(),
     *     lgArr = Lazy.range(100).toArray();
     *
     * Lazy(smArr).filter(isEven).each(Lazy.noop) // lazy - 10 elements
     * Lazy(lgArr).filter(isEven).each(Lazy.noop) // lazy - 100 elements
     * _.each(_.filter(smArr, isEven), _.noop)    // lodash - 10 elements
     * _.each(_.filter(lgArr, isEven), _.noop)    // lodash - 100 elements
     */
    Sequence.prototype.filter = function filter(filterFn) {
      return new FilteredSequence(this, createCallback(filterFn));
    };

    Sequence.prototype.select = function select(filterFn) {
      return this.filter(filterFn);
    };

    /**
     * @constructor
     */
    function FilteredSequence(parent, filterFn) {
      this.parent   = parent;
      this.filterFn = filterFn;
    }

    FilteredSequence.prototype = new Sequence();

    FilteredSequence.prototype.getIterator = function getIterator() {
      return new FilteringIterator(this.parent, this.filterFn);
    };

    FilteredSequence.prototype.each = function each(fn) {
      var filterFn = this.filterFn,
          j = 0;

      return this.parent.each(function(e, i) {
        if (filterFn(e, i)) {
          return fn(e, j++);
        }
      });
    };

    FilteredSequence.prototype.reverse = function reverse() {
      return this.parent.reverse().filter(this.filterFn);
    };

    /**
     * @constructor
     */
    function FilteringIterator(sequence, filterFn) {
      this.iterator = sequence.getIterator();
      this.filterFn = filterFn;
      this.index    = 0;
    }

    FilteringIterator.prototype.current = function current() {
      return this.value;
    };

    FilteringIterator.prototype.moveNext = function moveNext() {
      var iterator = this.iterator,
          filterFn = this.filterFn,
          value;

      while (iterator.moveNext()) {
        value = iterator.current();
        if (filterFn(value, this.index++)) {
          this.value = value;
          return true;
        }
      }

      this.value = undefined;
      return false;
    };

    /**
     * Creates a new sequence whose values exclude the elements of this sequence
     * identified by the specified predicate.
     *
     * @public
     * @param {Function} rejectFn The predicate to call on each element in this
     *     sequence, which returns true if the element should be omitted.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([1, 2, 3, 4, 5]).reject(isEven)              // sequence: [1, 3, 5]
     * Lazy([{ foo: 1 }, { bar: 2 }]).reject('foo')      // sequence: [{ bar: 2 }]
     * Lazy([{ foo: 1 }, { foo: 2 }]).reject({ foo: 2 }) // sequence: [{ foo: 1 }]
     */
    Sequence.prototype.reject = function reject(rejectFn) {
      rejectFn = createCallback(rejectFn);
      return this.filter(function(e) { return !rejectFn(e); });
    };

    /**
     * Creates a new sequence whose values have the specified type, as determined
     * by the `typeof` operator.
     *
     * @public
     * @param {string} type The type of elements to include from the underlying
     *     sequence, i.e. where `typeof [element] === [type]`.
     * @returns {Sequence} The new sequence, comprising elements of the specified
     *     type.
     *
     * @examples
     * Lazy([1, 2, 'foo', 'bar']).ofType('number')  // sequence: [1, 2]
     * Lazy([1, 2, 'foo', 'bar']).ofType('string')  // sequence: ['foo', 'bar']
     * Lazy([1, 2, 'foo', 'bar']).ofType('boolean') // sequence: []
     */
    Sequence.prototype.ofType = function ofType(type) {
      return this.filter(function(e) { return typeof e === type; });
    };

    /**
     * Creates a new sequence whose values are the elements of this sequence with
     * property names and values matching those of the specified object.
     *
     * @public
     * @param {Object} properties The properties that should be found on every
     *     element that is to be included in this sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * var people = [
     *   { first: "Dan", last: "Tao" },
     *   { first: "Bob", last: "Smith" }
     * ];
     *
     * Lazy(people).where({ first: "Dan" }) // sequence: [{ first: "Dan", last: "Tao" }]
     *
     * @benchmarks
     * var animals = ["dog", "cat", "mouse", "horse", "pig", "snake"];
     *
     * Lazy(animals).where({ length: 3 }).each(Lazy.noop) // lazy
     * _.each(_.where(animals, { length: 3 }), _.noop)    // lodash
     */
    Sequence.prototype.where = function where(properties) {
      return this.filter(properties);
    };

    /**
     * Creates a new sequence with the same elements as this one, but to be iterated
     * in the opposite order.
     *
     * Note that in some (but not all) cases, the only way to create such a sequence
     * may require iterating the entire underlying source when `each` is called.
     *
     * @public
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([1, 2, 3]).reverse() // sequence: [3, 2, 1]
     * Lazy([]).reverse()        // sequence: []
     */
    Sequence.prototype.reverse = function reverse() {
      return new ReversedSequence(this);
    };

    /**
     * @constructor
     */
    function ReversedSequence(parent) {
      this.parent = parent;
    }

    ReversedSequence.prototype = new Sequence();

    ReversedSequence.prototype.getIterator = function getIterator() {
      return new ReversedIterator(this.parent);
    };

    /**
     * @constuctor
     */
    function ReversedIterator(sequence) {
      this.sequence = sequence;
    }

    ReversedIterator.prototype.current = function current() {
      return this.getIndex().get(this.index);
    };

    ReversedIterator.prototype.moveNext = function moveNext() {
      var index  = this.getIndex(),
          length = index.length();

      if (typeof this.index === "undefined") {
        this.index = length;
      }

      return (--this.index >= 0);
    };

    ReversedIterator.prototype.getIndex = function getIndex() {
      if (!this.cachedIndex) {
        this.cachedIndex = this.sequence.getIndex();
      }

      return this.cachedIndex;
    };

    /**
     * Creates a new sequence with all of the elements of this one, plus those of
     * the given array(s).
     *
     * @public
     * @param {...*} var_args One or more values (or arrays of values) to use for
     *     additional items after this sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * var left  = [1, 2, 3];
     * var right = [4, 5, 6];
     *
     * Lazy(left).concat(right)         // sequence: [1, 2, 3, 4, 5, 6]
     * Lazy(left).concat(Lazy(right))   // sequence: [1, 2, 3, 4, 5, 6]
     * Lazy(left).concat(right, [7, 8]) // sequence: [1, 2, 3, 4, 5, 6, 7, 8]
     */
    Sequence.prototype.concat = function concat(var_args) {
      return new ConcatenatedSequence(this, arraySlice.call(arguments, 0));
    };

    /**
     * @constructor
     */
    function ConcatenatedSequence(parent, arrays) {
      this.parent = parent;
      this.arrays = arrays;
    }

    ConcatenatedSequence.prototype = new Sequence();

    ConcatenatedSequence.prototype.each = function each(fn) {
      var done = false,
          i = 0;

      this.parent.each(function(e) {
        if (fn(e, i++) === false) {
          done = true;
          return false;
        }
      });

      if (!done) {
        Lazy(this.arrays).flatten().each(function(e) {
          if (fn(e, i++) === false) {
            return false;
          }
        });
      }
    };

    /**
     * Creates a new sequence comprising the first N elements from this sequence, OR
     * (if N is `undefined`) simply returns the first element of this sequence.
     *
     * @public
     * @aka head, take
     * @param {number=} count The number of elements to take from this sequence. If
     *     this value exceeds the length of the sequence, the resulting sequence
     *     will be essentially the same as this one.
     * @returns {*} The new sequence (or the first element from this sequence if
     *     no count was given).
     *
     * @examples
     * function powerOfTwo(exp) {
     *   return Math.pow(2, exp);
     * }
     *
     * Lazy.generate(powerOfTwo).first()          // => 1
     * Lazy.generate(powerOfTwo).first(5)         // sequence: [1, 2, 4, 8, 16]
     * Lazy.generate(powerOfTwo).skip(2).first()  // => 4
     * Lazy.generate(powerOfTwo).skip(2).first(2) // sequence: [4, 8]
     */
    Sequence.prototype.first = function first(count) {
      if (typeof count === "undefined") {
        return getFirst(this);
      }
      return new TakeSequence(this, count);
    };

    Sequence.prototype.head =
    Sequence.prototype.take = function (count) {
      return this.first(count);
    };

    /**
     * @constructor
     */
    function TakeSequence(parent, count) {
      this.parent = parent;
      this.count  = count;
    }

    TakeSequence.prototype = new Sequence();

    TakeSequence.prototype.getIterator = function getIterator() {
      return new TakeIterator(this.parent, this.count);
    };

    TakeSequence.prototype.each = function each(fn) {
      var count = this.count,
          i     = 0;

      var result;
      var handle = this.parent.each(function(e) {
        if (i < count) { result = fn(e, i++); }
        if (i >= count) { return false; }
        return result;
      });

      if (handle instanceof AsyncHandle) {
        return handle;
      }

      return i === count && result !== false;
    };

    /**
     * @constructor
     */
    function TakeIterator(sequence, count) {
      this.iterator = sequence.getIterator();
      this.count    = count;
    }

    TakeIterator.prototype.current = function current() {
      return this.iterator.current();
    };

    TakeIterator.prototype.moveNext = function moveNext() {
      return ((--this.count >= 0) && this.iterator.moveNext());
    };

    /**
     * Creates a new sequence comprising the elements from the head of this sequence
     * that satisfy some predicate. Once an element is encountered that doesn't
     * satisfy the predicate, iteration will stop.
     *
     * @public
     * @param {Function} predicate
     * @returns {Sequence} The new sequence
     *
     * @examples
     * function lessThan(x) {
     *   return function(y) {
     *     return y < x;
     *   };
     * }
     *
     * Lazy([1, 2, 3, 4]).takeWhile(lessThan(3)) // sequence: [1, 2]
     * Lazy([1, 2, 3, 4]).takeWhile(lessThan(0)) // sequence: []
     */
    Sequence.prototype.takeWhile = function takeWhile(predicate) {
      return new TakeWhileSequence(this, predicate);
    };

    /**
     * @constructor
     */
    function TakeWhileSequence(parent, predicate) {
      this.parent    = parent;
      this.predicate = predicate;
    }

    TakeWhileSequence.prototype = new Sequence();

    TakeWhileSequence.prototype.each = function each(fn) {
      var predicate = this.predicate,
          finished = false,
          j = 0;

      var result = this.parent.each(function(e, i) {
        if (!predicate(e, i)) {
          finished = true;
          return false;
        }

        return fn(e, j++);
      });

      if (result instanceof AsyncHandle) {
        return result;
      }

      return finished;
    };

    /**
     * Creates a new sequence comprising all but the last N elements of this
     * sequence.
     *
     * @public
     * @param {number=} count The number of items to omit from the end of the
     *     sequence (defaults to 1).
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([1, 2, 3, 4]).initial()                    // sequence: [1, 2, 3]
     * Lazy([1, 2, 3, 4]).initial(2)                   // sequence: [1, 2]
     * Lazy([1, 2, 3]).filter(Lazy.identity).initial() // sequence: [1, 2]
     */
    Sequence.prototype.initial = function initial(count) {
      return new InitialSequence(this, count);
    };

    function InitialSequence(parent, count) {
      this.parent = parent;
      this.count = typeof count === "number" ? count : 1;
    }

    InitialSequence.prototype = new Sequence();

    InitialSequence.prototype.each = function each(fn) {
      var index = this.parent.getIndex();
      return index.take(index.length() - this.count).each(fn);
    };

    /**
     * Creates a new sequence comprising the last N elements of this sequence, OR
     * (if N is `undefined`) simply returns the last element of this sequence.
     *
     * @public
     * @param {number=} count The number of items to take from the end of the
     *     sequence.
     * @returns {*} The new sequence (or the last element from this sequence
     *     if no count was given).
     *
     * @examples
     * Lazy([1, 2, 3]).last()                 // => 3
     * Lazy([1, 2, 3]).last(2)                // sequence: [2, 3]
     * Lazy([1, 2, 3]).filter(isEven).last(2) // sequence: [2]
     */
    Sequence.prototype.last = function last(count) {
      if (typeof count === "undefined") {
        return this.reverse().first();
      }
      return this.reverse().take(count).reverse();
    };

    /**
     * Returns the first element in this sequence with property names and values
     * matching those of the specified object.
     *
     * @public
     * @param {Object} properties The properties that should be found on some
     *     element in this sequence.
     * @returns {*} The found element, or `undefined` if none exists in this
     *     sequence.
     *
     * @examples
     * var words = ["foo", "bar"];
     *
     * Lazy(words).findWhere({ 0: "f" }); // => "foo"
     * Lazy(words).findWhere({ 0: "z" }); // => undefined
     */
    Sequence.prototype.findWhere = function findWhere(properties) {
      return this.where(properties).first();
    };

    /**
     * Creates a new sequence comprising all but the first N elements of this
     * sequence.
     *
     * @public
     * @aka skip, tail, rest
     * @param {number=} count The number of items to omit from the beginning of the
     *     sequence (defaults to 1).
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([1, 2, 3, 4]).rest()  // sequence: [2, 3, 4]
     * Lazy([1, 2, 3, 4]).rest(0) // sequence: [1, 2, 3, 4]
     * Lazy([1, 2, 3, 4]).rest(2) // sequence: [3, 4]
     * Lazy([1, 2, 3, 4]).rest(5) // sequence: []
     */
    Sequence.prototype.rest = function rest(count) {
      return new DropSequence(this, count);
    };

    Sequence.prototype.skip =
    Sequence.prototype.tail =
    Sequence.prototype.drop = function drop(count) {
      return this.rest(count);
    };

    /**
     * @constructor
     */
    function DropSequence(parent, count) {
      this.parent = parent;
      this.count  = typeof count === "number" ? count : 1;
    }

    DropSequence.prototype = new Sequence();

    DropSequence.prototype.each = function each(fn) {
      var count   = this.count,
          dropped = 0,
          i       = 0;

      return this.parent.each(function(e) {
        if (dropped++ < count) { return; }
        return fn(e, i++);
      });
    };

    /**
     * Creates a new sequence comprising the elements from this sequence *after*
     * those that satisfy some predicate. The sequence starts with the first
     * element that does not match the predicate.
     *
     * @public
     * @aka skipWhile
     * @param {Function} predicate
     * @returns {Sequence} The new sequence
     */
    Sequence.prototype.dropWhile = function dropWhile(predicate) {
      return new DropWhileSequence(this, predicate);
    };

    Sequence.prototype.skipWhile = function skipWhile(predicate) {
      return this.dropWhile(predicate);
    };

    /**
     * @constructor
     */
    function DropWhileSequence(parent, predicate) {
      this.parent    = parent;
      this.predicate = predicate;
    }

    DropWhileSequence.prototype = new Sequence();

    DropWhileSequence.prototype.each = function each(fn) {
      var predicate = this.predicate,
          done      = false;

      return this.parent.each(function(e) {
        if (!done) {
          if (predicate(e)) {
            return;
          }

          done = true;
        }

        return fn(e);
      });
    };

    /**
     * Creates a new sequence with the same elements as this one, but ordered
     * using the specified comparison function.
     *
     * This has essentially the same behavior as calling
     * [`Array#sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort),
     * but obviously instead of modifying the collection it returns a new
     * {@link Sequence} object.
     *
     * @public
     * @param {Function=} sortFn The function used to compare elements in the
     *     sequence. The function will be passed two elements and should return:
     *     - 1 if the first is greater
     *     - -1 if the second is greater
     *     - 0 if the two values are the same
     * @param {boolean} descending Whether or not the resulting sequence should be
     *     in descending order (defaults to `false`).
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([5, 10, 1]).sort()                // sequence: [1, 5, 10]
     * Lazy(['foo', 'bar']).sort()            // sequence: ['bar', 'foo']
     * Lazy(['b', 'c', 'a']).sort(null, true) // sequence: ['c', 'b', 'a']
     * Lazy([5, 10, 1]).sort(null, true)      // sequence: [10, 5, 1]
     *
     * // Sorting w/ custom comparison function
     * Lazy(['a', 'ab', 'aa', 'ba', 'b', 'abc']).sort(function compare(x, y) {
     *   if (x.length && (x.length !== y.length)) { return compare(x.length, y.length); }
     *   if (x === y) { return 0; }
     *   return x > y ? 1 : -1;
     * });
     * // => sequence: ['a', 'b', 'aa', 'ab', 'ba', 'abc']
     */
    Sequence.prototype.sort = function sort(sortFn, descending) {
      sortFn || (sortFn = compare);
      if (descending) { sortFn = reverseArguments(sortFn); }
      return new SortedSequence(this, sortFn);
    };

    /**
     * Creates a new sequence with the same elements as this one, but ordered by
     * the results of the given function.
     *
     * You can pass:
     *
     * - a *string*, to sort by the named property
     * - a function, to sort by the result of calling the function on each element
     *
     * @public
     * @param {Function} sortFn The function to call on the elements in this
     *     sequence, in order to sort them.
     * @param {boolean} descending Whether or not the resulting sequence should be
     *     in descending order (defaults to `false`).
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * function population(country) {
     *   return country.pop;
     * }
     *
     * function area(country) {
     *   return country.sqkm;
     * }
     *
     * var countries = [
     *   { name: "USA", pop: 320000000, sqkm: 9600000 },
     *   { name: "Brazil", pop: 194000000, sqkm: 8500000 },
     *   { name: "Nigeria", pop: 174000000, sqkm: 924000 },
     *   { name: "China", pop: 1350000000, sqkm: 9700000 },
     *   { name: "Russia", pop: 143000000, sqkm: 17000000 },
     *   { name: "Australia", pop: 23000000, sqkm: 7700000 }
     * ];
     *
     * Lazy(countries).sortBy(population).last(3).pluck('name') // sequence: ["Brazil", "USA", "China"]
     * Lazy(countries).sortBy(area).last(3).pluck('name')       // sequence: ["USA", "China", "Russia"]
     * Lazy(countries).sortBy(area, true).first(3).pluck('name') // sequence: ["Russia", "China", "USA"]
     *
     * @benchmarks
     * var randoms = Lazy.generate(Math.random).take(100).toArray();
     *
     * Lazy(randoms).sortBy(Lazy.identity).each(Lazy.noop) // lazy
     * _.each(_.sortBy(randoms, Lazy.identity), _.noop)    // lodash
     */
    Sequence.prototype.sortBy = function sortBy(sortFn, descending) {
      sortFn = createComparator(sortFn);
      if (descending) { sortFn = reverseArguments(sortFn); }
      return new SortedSequence(this, sortFn);
    };

    /**
     * @constructor
     */
    function SortedSequence(parent, sortFn) {
      this.parent = parent;
      this.sortFn = sortFn;
    }

    SortedSequence.prototype = new Sequence();

    SortedSequence.prototype.each = function each(fn) {
      var sortFn = this.sortFn,
          result = this.parent.toArray();

      result.sort(sortFn);

      return forEach(result, fn);
    };

    /**
     * @examples
     * var items = [{ a: 4 }, { a: 3 }, { a: 5 }];
     *
     * Lazy(items).sortBy('a').reverse();
     * // => sequence: [{ a: 5 }, { a: 4 }, { a: 3 }]
     *
     * Lazy(items).sortBy('a').reverse().reverse();
     * // => sequence: [{ a: 3 }, { a: 4 }, { a: 5 }]
     */
    SortedSequence.prototype.reverse = function reverse() {
      return new SortedSequence(this.parent, reverseArguments(this.sortFn));
    };

    /**
     * Creates a new {@link ObjectLikeSequence} comprising the elements in this
     * one, grouped together according to some key. The value associated with each
     * key in the resulting object-like sequence is an array containing all of
     * the elements in this sequence with that key.
     *
     * @public
     * @param {Function|string} keyFn The function to call on the elements in this
     *     sequence to obtain a key by which to group them, or a string representing
     *     a parameter to read from all the elements in this sequence.
     * @param {Function|string} valFn (Optional) The function to call on the elements
     *     in this sequence to assign to the value for each instance to appear in the
     *     group, or a string representing a parameter to read from all the elements
     *     in this sequence.
     * @returns {ObjectLikeSequence} The new sequence.
     *
     * @examples
     * function oddOrEven(x) {
     *   return x % 2 === 0 ? 'even' : 'odd';
     * }
     * function square(x) {
     *   return x*x;
     * }
     *
     * var numbers = [1, 2, 3, 4, 5];
     *
     * Lazy(numbers).groupBy(oddOrEven)                     // sequence: { odd: [1, 3, 5], even: [2, 4] }
     * Lazy(numbers).groupBy(oddOrEven).get("odd")          // => [1, 3, 5]
     * Lazy(numbers).groupBy(oddOrEven).get("foo")          // => undefined
     * Lazy(numbers).groupBy(oddOrEven, square).get("even") // => [4, 16]
     *
     * Lazy([
     *   { name: 'toString' },
     *   { name: 'toString' }
     * ]).groupBy('name');
     * // => sequence: {
     *   'toString': [
     *     { name: 'toString' },
     *     { name: 'toString' }
     *   ]
     * }
     */
    Sequence.prototype.groupBy = function groupBy(keyFn, valFn) {
      return new GroupedSequence(this, keyFn, valFn);
    };

    /**
     * @constructor
     */
    function GroupedSequence(parent, keyFn, valFn) {
      this.parent = parent;
      this.keyFn  = keyFn;
      this.valFn  = valFn;
    }

    // GroupedSequence must have its prototype set after ObjectLikeSequence has
    // been fully initialized.

    /**
     * Creates a new {@link ObjectLikeSequence} comprising the elements in this
     * one, indexed according to some key.
     *
     * @public
     * @param {Function|string} keyFn The function to call on the elements in this
     *     sequence to obtain a key by which to index them, or a string
     *     representing a property to read from all the elements in this sequence.
     * @param {Function|string} valFn (Optional) The function to call on the elements
     *     in this sequence to assign to the value of the indexed object, or a string
     *     representing a parameter to read from all the elements in this sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * var people = [
     *   { name: 'Bob', age: 25 },
     *   { name: 'Fred', age: 34 }
     * ];
     *
     * var bob  = people[0],
     *     fred = people[1];
     *
     * Lazy(people).indexBy('name')        // sequence: { 'Bob': bob, 'Fred': fred }
     * Lazy(people).indexBy('name', 'age') // sequence: { 'Bob': 25, 'Fred': 34 }
     */
    Sequence.prototype.indexBy = function(keyFn, valFn) {
      return new IndexedSequence(this, keyFn, valFn);
    };

    /**
     * @constructor
     */
    function IndexedSequence(parent, keyFn, valFn) {
      this.parent = parent;
      this.keyFn  = keyFn;
      this.valFn  = valFn;
    }

    // IndexedSequence must have its prototype set after ObjectLikeSequence has
    // been fully initialized.

    /**
     * Creates a new {@link ObjectLikeSequence} containing the unique keys of all
     * the elements in this sequence, each paired with the number of elements
     * in this sequence having that key.
     *
     * @public
     * @param {Function|string} keyFn The function to call on the elements in this
     *     sequence to obtain a key by which to count them, or a string representing
     *     a parameter to read from all the elements in this sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * function oddOrEven(x) {
     *   return x % 2 === 0 ? 'even' : 'odd';
     * }
     *
     * var numbers = [1, 2, 3, 4, 5];
     *
     * Lazy(numbers).countBy(oddOrEven)            // sequence: { odd: 3, even: 2 }
     * Lazy(numbers).countBy(oddOrEven).get("odd") // => 3
     * Lazy(numbers).countBy(oddOrEven).get("foo") // => undefined
     */
    Sequence.prototype.countBy = function countBy(keyFn) {
      return new CountedSequence(this, keyFn);
    };

    /**
     * @constructor
     */
    function CountedSequence(parent, keyFn) {
      this.parent = parent;
      this.keyFn  = keyFn;
    }

    // CountedSequence, like GroupedSequence, must have its prototype set after
    // ObjectLikeSequence has been fully initialized.

    /**
     * Creates a new sequence with every unique element from this one appearing
     * exactly once (i.e., with duplicates removed).
     *
     * @public
     * @aka unique
     * @param {Function} keyFn An optional function to produce the key for each
     *     object. This key is then tested for uniqueness as  opposed to the
     *     object reference.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([1, 2, 2, 3, 3, 3]).uniq() // sequence: [1, 2, 3]
     * Lazy([{ name: 'mike' }, 
     * 	{ name: 'sarah' }, 
     * 	{ name: 'mike' }
     * ]).uniq('name')
     * // sequence: [{ name: 'mike' }, { name: 'sarah' }]
     *
     * @benchmarks
     * function randomOf(array) {
     *   return function() {
     *     return array[Math.floor(Math.random() * array.length)];
     *   };
     * }
     *
     * var mostUnique = Lazy.generate(randomOf(_.range(100)), 100).toArray(),
     *     someUnique = Lazy.generate(randomOf(_.range(50)), 100).toArray(),
     *     mostDupes  = Lazy.generate(randomOf(_.range(5)), 100).toArray();
     *
     * Lazy(mostUnique).uniq().each(Lazy.noop) // lazy - mostly unique elements
     * Lazy(someUnique).uniq().each(Lazy.noop) // lazy - some unique elements
     * Lazy(mostDupes).uniq().each(Lazy.noop)  // lazy - mostly duplicate elements
     * _.each(_.uniq(mostUnique), _.noop)      // lodash - mostly unique elements
     * _.each(_.uniq(someUnique), _.noop)      // lodash - some unique elements
     * _.each(_.uniq(mostDupes), _.noop)       // lodash - mostly duplicate elements
     */
    Sequence.prototype.uniq = function uniq(keyFn) {
      return new UniqueSequence(this, keyFn);
    };

    Sequence.prototype.unique = function unique(keyFn) {
      return this.uniq(keyFn);
    };

    /**
     * @constructor
     */
    function UniqueSequence(parent, keyFn) {
      this.parent = parent;
      this.keyFn  = keyFn;
    }

    UniqueSequence.prototype = new Sequence();

    UniqueSequence.prototype.each = function each(fn) {
      var cache = new Set(),
          keyFn = this.keyFn,
          i     = 0;

      if (keyFn) {
        keyFn = createCallback(keyFn);
        return this.parent.each(function(e) {
          if (cache.add(keyFn(e))) {
            return fn(e, i++);
          }
        });

      } else {
        return this.parent.each(function(e) {
          if (cache.add(e)) {
            return fn(e, i++);
          }
        });
      }
    };

    /**
     * Creates a new sequence by combining the elements from this sequence with
     * corresponding elements from the specified array(s).
     *
     * @public
     * @param {...Array} var_args One or more arrays of elements to combine with
     *     those of this sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([1, 2]).zip([3, 4]) // sequence: [[1, 3], [2, 4]]
     *
     * @benchmarks
     * var smArrL = Lazy.range(10).toArray(),
     *     smArrR = Lazy.range(10, 20).toArray(),
     *     lgArrL = Lazy.range(100).toArray(),
     *     lgArrR = Lazy.range(100, 200).toArray();
     *
     * Lazy(smArrL).zip(smArrR).each(Lazy.noop) // lazy - zipping 10-element arrays
     * Lazy(lgArrL).zip(lgArrR).each(Lazy.noop) // lazy - zipping 100-element arrays
     * _.each(_.zip(smArrL, smArrR), _.noop)    // lodash - zipping 10-element arrays
     * _.each(_.zip(lgArrL, lgArrR), _.noop)    // lodash - zipping 100-element arrays
     */
    Sequence.prototype.zip = function zip(var_args) {
      if (arguments.length === 1) {
        return new SimpleZippedSequence(this, (/** @type {Array} */ var_args));
      } else {
        return new ZippedSequence(this, arraySlice.call(arguments, 0));
      }
    };

    /**
     * @constructor
     */
    function ZippedSequence(parent, arrays) {
      this.parent = parent;
      this.arrays = arrays;
    }

    ZippedSequence.prototype = new Sequence();

    ZippedSequence.prototype.each = function each(fn) {
      var arrays = this.arrays,
          i = 0;
      this.parent.each(function(e) {
        var group = [e];
        for (var j = 0; j < arrays.length; ++j) {
          if (arrays[j].length > i) {
            group.push(arrays[j][i]);
          }
        }
        return fn(group, i++);
      });
    };

    /**
     * Creates a new sequence with the same elements as this one, in a randomized
     * order.
     *
     * @public
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([1, 2, 3, 4, 5]).shuffle().value() // =~ [1, 2, 3, 4, 5]
     */
    Sequence.prototype.shuffle = function shuffle() {
      return new ShuffledSequence(this);
    };

    /**
     * @constructor
     */
    function ShuffledSequence(parent) {
      this.parent = parent;
    }

    ShuffledSequence.prototype = new Sequence();

    ShuffledSequence.prototype.each = function each(fn) {
      var shuffled = this.parent.toArray(),
          floor = Math.floor,
          random = Math.random,
          j = 0;

      for (var i = shuffled.length - 1; i > 0; --i) {
        swap(shuffled, i, floor(random() * (i + 1)));
        if (fn(shuffled[i], j++) === false) {
          return;
        }
      }
      fn(shuffled[0], j);
    };

    /**
     * Creates a new sequence with every element from this sequence, and with arrays
     * exploded so that a sequence of arrays (of arrays) becomes a flat sequence of
     * values.
     *
     * @public
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([1, [2, 3], [4, [5]]]).flatten() // sequence: [1, 2, 3, 4, 5]
     * Lazy([1, Lazy([2, 3])]).flatten()     // sequence: [1, 2, 3]
     */
    Sequence.prototype.flatten = function flatten() {
      return new FlattenedSequence(this);
    };

    /**
     * @constructor
     */
    function FlattenedSequence(parent) {
      this.parent = parent;
    }

    FlattenedSequence.prototype = new Sequence();

    FlattenedSequence.prototype.each = function each(fn) {
      var index = 0;

      return this.parent.each(function recurseVisitor(e) {
        if (e instanceof Array) {
          return forEach(e, recurseVisitor);
        }

        if (e instanceof Sequence) {
          return e.each(recurseVisitor);
        }

        return fn(e, index++);
      });
    };

    /**
     * Creates a new sequence with the same elements as this one, except for all
     * falsy values (`false`, `0`, `""`, `null`, and `undefined`).
     *
     * @public
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy(["foo", null, "bar", undefined]).compact() // sequence: ["foo", "bar"]
     */
    Sequence.prototype.compact = function compact() {
      return this.filter(function(e) { return !!e; });
    };

    /**
     * Creates a new sequence with all the elements of this sequence that are not
     * also among the specified arguments.
     *
     * @public
     * @aka difference
     * @param {...*} var_args The values, or array(s) of values, to be excluded from the
     *     resulting sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy([1, 2, 3, 4, 5]).without(2, 3)   // sequence: [1, 4, 5]
     * Lazy([1, 2, 3, 4, 5]).without([4, 5]) // sequence: [1, 2, 3]
     */
    Sequence.prototype.without = function without(var_args) {
      return new WithoutSequence(this, arraySlice.call(arguments, 0));
    };

    Sequence.prototype.difference = function difference(var_args) {
      return this.without.apply(this, arguments);
    };

    /**
     * @constructor
     */
    function WithoutSequence(parent, values) {
      this.parent = parent;
      this.values = values;
    }

    WithoutSequence.prototype = new Sequence();

    WithoutSequence.prototype.each = function each(fn) {
      var set = createSet(this.values),
          i = 0;
      return this.parent.each(function(e) {
        if (!set.contains(e)) {
          return fn(e, i++);
        }
      });
    };

    /**
     * Creates a new sequence with all the unique elements either in this sequence
     * or among the specified arguments.
     *
     * @public
     * @param {...*} var_args The values, or array(s) of values, to be additionally
     *     included in the resulting sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy(["foo", "bar"]).union([])             // sequence: ["foo", "bar"]
     * Lazy(["foo", "bar"]).union(["bar", "baz"]) // sequence: ["foo", "bar", "baz"]
     */
    Sequence.prototype.union = function union(var_args) {
      return this.concat(var_args).uniq();
    };

    /**
     * Creates a new sequence with all the elements of this sequence that also
     * appear among the specified arguments.
     *
     * @public
     * @param {...*} var_args The values, or array(s) of values, in which elements
     *     from this sequence must also be included to end up in the resulting sequence.
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * Lazy(["foo", "bar"]).intersection([])             // sequence: []
     * Lazy(["foo", "bar"]).intersection(["bar", "baz"]) // sequence: ["bar"]
     */
    Sequence.prototype.intersection = function intersection(var_args) {
      if (arguments.length === 1 && arguments[0] instanceof Array) {
        return new SimpleIntersectionSequence(this, (/** @type {Array} */ var_args));
      } else {
        return new IntersectionSequence(this, arraySlice.call(arguments, 0));
      }
    };

    /**
     * @constructor
     */
    function IntersectionSequence(parent, arrays) {
      this.parent = parent;
      this.arrays = arrays;
    }

    IntersectionSequence.prototype = new Sequence();

    IntersectionSequence.prototype.each = function each(fn) {
      var sets = Lazy(this.arrays).map(function(values) {
        return new UniqueMemoizer(Lazy(values).getIterator());
      });

      var setIterator = new UniqueMemoizer(sets.getIterator()),
          i = 0;

      return this.parent.each(function(e) {
        var includedInAll = true;
        setIterator.each(function(set) {
          if (!set.contains(e)) {
            includedInAll = false;
            return false;
          }
        });

        if (includedInAll) {
          return fn(e, i++);
        }
      });
    };

    /**
     * @constructor
     */
    function UniqueMemoizer(iterator) {
      this.iterator     = iterator;
      this.set          = new Set();
      this.memo         = [];
      this.currentValue = undefined;
    }

    UniqueMemoizer.prototype.current = function current() {
      return this.currentValue;
    };

    UniqueMemoizer.prototype.moveNext = function moveNext() {
      var iterator = this.iterator,
          set = this.set,
          memo = this.memo,
          current;

      while (iterator.moveNext()) {
        current = iterator.current();
        if (set.add(current)) {
          memo.push(current);
          this.currentValue = current;
          return true;
        }
      }
      return false;
    };

    UniqueMemoizer.prototype.each = function each(fn) {
      var memo = this.memo,
          length = memo.length,
          i = -1;

      while (++i < length) {
        if (fn(memo[i], i) === false) {
          return false;
        }
      }

      while (this.moveNext()) {
        if (fn(this.currentValue, i++) === false) {
          break;
        }
      }
    };

    UniqueMemoizer.prototype.contains = function contains(e) {
      if (this.set.contains(e)) {
        return true;
      }

      while (this.moveNext()) {
        if (this.currentValue === e) {
          return true;
        }
      }

      return false;
    };

    /**
     * Checks whether every element in this sequence satisfies a given predicate.
     *
     * @public
     * @aka all
     * @param {Function} predicate A function to call on (potentially) every element
     *     in this sequence.
     * @returns {boolean} True if `predicate` returns true for every element in the
     *     sequence (or the sequence is empty). False if `predicate` returns false
     *     for at least one element.
     *
     * @examples
     * var numbers = [1, 2, 3, 4, 5];
     *
     * var objects = [{ foo: true }, { foo: false, bar: true }];
     *
     * Lazy(numbers).every(isEven)     // => false
     * Lazy(numbers).every(isPositive) // => true
     * Lazy(objects).all('foo')        // => false
     * Lazy(objects).all('bar')        // => false
     */
    Sequence.prototype.every = function every(predicate) {
      predicate = createCallback(predicate);

      return this.each(function(e, i) {
        return !!predicate(e, i);
      });
    };

    Sequence.prototype.all = function all(predicate) {
      return this.every(predicate);
    };

    /**
     * Checks whether at least one element in this sequence satisfies a given
     * predicate (or, if no predicate is specified, whether the sequence contains at
     * least one element).
     *
     * @public
     * @aka any
     * @param {Function=} predicate A function to call on (potentially) every element
     *     in this sequence.
     * @returns {boolean} True if `predicate` returns true for at least one element
     *     in the sequence. False if `predicate` returns false for every element (or
     *     the sequence is empty).
     *
     * @examples
     * var numbers = [1, 2, 3, 4, 5];
     *
     * Lazy(numbers).some()           // => true
     * Lazy(numbers).some(isEven)     // => true
     * Lazy(numbers).some(isNegative) // => false
     * Lazy([]).some()                // => false
     */
    Sequence.prototype.some = function some(predicate) {
      predicate = createCallback(predicate, true);

      var success = false;
      this.each(function(e) {
        if (predicate(e)) {
          success = true;
          return false;
        }
      });
      return success;
    };

    Sequence.prototype.any = function any(predicate) {
      return this.some(predicate);
    };

    /**
     * Checks whether NO elements in this sequence satisfy the given predicate
     * (the opposite of {@link Sequence#all}, basically).
     *
     * @public
     * @param {Function=} predicate A function to call on (potentially) every element
     *     in this sequence.
     * @returns {boolean} True if `predicate` does not return true for any element
     *     in the sequence. False if `predicate` returns true for at least one
     *     element.
     *
     * @examples
     * var numbers = [1, 2, 3, 4, 5];
     *
     * Lazy(numbers).none()           // => false
     * Lazy(numbers).none(isEven)     // => false
     * Lazy(numbers).none(isNegative) // => true
     * Lazy([]).none(isEven)          // => true
     * Lazy([]).none(isNegative)      // => true
     * Lazy([]).none()                // => true
     */
    Sequence.prototype.none = function none(predicate) {
      return !this.any(predicate);
    };

    /**
     * Checks whether the sequence has no elements.
     *
     * @public
     * @returns {boolean} True if the sequence is empty, false if it contains at
     *     least one element.
     *
     * @examples
     * Lazy([]).isEmpty()        // => true
     * Lazy([1, 2, 3]).isEmpty() // => false
     */
    Sequence.prototype.isEmpty = function isEmpty() {
      return !this.any();
    };

    /**
     * Performs (at worst) a linear search from the head of this sequence,
     * returning the first index at which the specified value is found.
     *
     * @public
     * @param {*} value The element to search for in the sequence.
     * @returns {number} The index within this sequence where the given value is
     *     located, or -1 if the sequence doesn't contain the value.
     *
     * @examples
     * function reciprocal(x) { return 1 / x; }
     *
     * Lazy(["foo", "bar", "baz"]).indexOf("bar")   // => 1
     * Lazy([1, 2, 3]).indexOf(4)                   // => -1
     * Lazy([1, 2, 3]).map(reciprocal).indexOf(0.5) // => 1
     */
    Sequence.prototype.indexOf = function indexOf(value) {
      var foundIndex = -1;
      this.each(function(e, i) {
        if (e === value) {
          foundIndex = i;
          return false;
        }
      });
      return foundIndex;
    };

    /**
     * Performs (at worst) a linear search from the tail of this sequence,
     * returning the last index at which the specified value is found.
     *
     * @public
     * @param {*} value The element to search for in the sequence.
     * @returns {number} The last index within this sequence where the given value
     *     is located, or -1 if the sequence doesn't contain the value.
     *
     * @examples
     * Lazy(["a", "b", "c", "b", "a"]).lastIndexOf("b")    // => 3
     * Lazy([1, 2, 3]).lastIndexOf(0)                      // => -1
     * Lazy([2, 2, 1, 2, 4]).filter(isEven).lastIndexOf(2) // 2
     */
    Sequence.prototype.lastIndexOf = function lastIndexOf(value) {
      var reversed = this.getIndex().reverse(),
          index    = reversed.indexOf(value);
      if (index !== -1) {
        index = reversed.length() - index - 1;
      }
      return index;
    };

    /**
     * Performs a binary search of this sequence, returning the lowest index where
     * the given value is either found, or where it belongs (if it is not already
     * in the sequence).
     *
     * This method assumes the sequence is in sorted order and will fail otherwise.
     *
     * @public
     * @param {*} value The element to search for in the sequence.
     * @returns {number} An index within this sequence where the given value is
     *     located, or where it belongs in sorted order.
     *
     * @examples
     * Lazy([1, 3, 6, 9]).sortedIndex(3)                    // => 1
     * Lazy([1, 3, 6, 9]).sortedIndex(7)                    // => 3
     * Lazy([5, 10, 15, 20]).filter(isEven).sortedIndex(10) // => 0
     * Lazy([5, 10, 15, 20]).filter(isEven).sortedIndex(12) // => 1
     */
    Sequence.prototype.sortedIndex = function sortedIndex(value) {
      var indexed = this.getIndex(),
          lower   = 0,
          upper   = indexed.length(),
          i;

      while (lower < upper) {
        i = (lower + upper) >>> 1;
        if (compare(indexed.get(i), value) === -1) {
          lower = i + 1;
        } else {
          upper = i;
        }
      }
      return lower;
    };

    /**
     * Checks whether the given value is in this sequence.
     *
     * @public
     * @param {*} value The element to search for in the sequence.
     * @returns {boolean} True if the sequence contains the value, false if not.
     *
     * @examples
     * var numbers = [5, 10, 15, 20];
     *
     * Lazy(numbers).contains(15) // => true
     * Lazy(numbers).contains(13) // => false
     */
    Sequence.prototype.contains = function contains(value) {
      return this.indexOf(value) !== -1;
    };

    /**
     * Aggregates a sequence into a single value according to some accumulator
     * function.
     *
     * For an asynchronous sequence, instead of immediately returning a result
     * (which it can't, obviously), this method returns an {@link AsyncHandle}
     * whose `onComplete` method can be called to supply a callback to handle the
     * final result once iteration has completed.
     *
     * @public
     * @aka inject, foldl
     * @param {Function} aggregator The function through which to pass every element
     *     in the sequence. For every element, the function will be passed the total
     *     aggregated result thus far and the element itself, and should return a
     *     new aggregated result.
     * @param {*=} memo The starting value to use for the aggregated result
     *     (defaults to the first element in the sequence).
     * @returns {*} The result of the aggregation, or, for asynchronous sequences,
     *     an {@link AsyncHandle} whose `onComplete` method accepts a callback to
     *     handle the final result.
     *
     * @examples
     * function multiply(x, y) { return x * y; }
     *
     * var numbers = [1, 2, 3, 4];
     *
     * Lazy(numbers).reduce(multiply)    // => 24
     * Lazy(numbers).reduce(multiply, 5) // => 120
     */
    Sequence.prototype.reduce = function reduce(aggregator, memo) {
      if (arguments.length < 2) {
        return this.tail().reduce(aggregator, this.head());
      }

      var eachResult = this.each(function(e, i) {
        memo = aggregator(memo, e, i);
      });

      // TODO: Think of a way more efficient solution to this problem.
      if (eachResult instanceof AsyncHandle) {
        return eachResult.then(function() { return memo; });
      }

      return memo;
    };

    Sequence.prototype.inject =
    Sequence.prototype.foldl = function foldl(aggregator, memo) {
      return this.reduce(aggregator, memo);
    };

    /**
     * Aggregates a sequence, from the tail, into a single value according to some
     * accumulator function.
     *
     * @public
     * @aka foldr
     * @param {Function} aggregator The function through which to pass every element
     *     in the sequence. For every element, the function will be passed the total
     *     aggregated result thus far and the element itself, and should return a
     *     new aggregated result.
     * @param {*} memo The starting value to use for the aggregated result.
     * @returns {*} The result of the aggregation.
     *
     * @examples
     * function append(s1, s2) {
     *   return s1 + s2;
     * }
     *
     * function isVowel(str) {
     *   return "aeiou".indexOf(str) !== -1;
     * }
     *
     * Lazy("abcde").reduceRight(append)                 // => "edcba"
     * Lazy("abcde").filter(isVowel).reduceRight(append) // => "ea"
     */
    Sequence.prototype.reduceRight = function reduceRight(aggregator, memo) {
      if (arguments.length < 2) {
        return this.initial(1).reduceRight(aggregator, this.last());
      }

      // This bothers me... but frankly, calling reverse().reduce() is potentially
      // going to eagerly evaluate the sequence anyway; so it's really not an issue.
      var indexed = this.getIndex(),
          i = indexed.length() - 1;
      return indexed.reverse().reduce(function(m, e) {
        return aggregator(m, e, i--);
      }, memo);
    };

    Sequence.prototype.foldr = function foldr(aggregator, memo) {
      return this.reduceRight(aggregator, memo);
    };

    /**
     * Groups this sequence into consecutive (overlapping) segments of a specified
     * length. If the underlying sequence has fewer elements than the specfied
     * length, then this sequence will be empty.
     *
     * @public
     * @param {number} length The length of each consecutive segment.
     * @returns {Sequence} The resulting sequence of consecutive segments.
     *
     * @examples
     * Lazy([]).consecutive(2)        // => sequence: []
     * Lazy([1]).consecutive(2)       // => sequence: []
     * Lazy([1, 2]).consecutive(2)    // => sequence: [[1, 2]]
     * Lazy([1, 2, 3]).consecutive(2) // => sequence: [[1, 2], [2, 3]]
     * Lazy([1, 2, 3]).consecutive(0) // => sequence: [[]]
     * Lazy([1, 2, 3]).consecutive(1) // => sequence: [[1], [2], [3]]
     */
    Sequence.prototype.consecutive = function consecutive(count) {
      var queue    = new Queue(count);
      var segments = this.map(function(element) {
        if (queue.add(element).count === count) {
          return queue.toArray();
        }
      });
      return segments.compact();
    };

    /**
     * Breaks this sequence into chunks (arrays) of a specified length.
     *
     * @public
     * @param {number} size The size of each chunk.
     * @returns {Sequence} The resulting sequence of chunks.
     *
     * @examples
     * Lazy([]).chunk(2)        // sequence: []
     * Lazy([1, 2, 3]).chunk(2) // sequence: [[1, 2], [3]]
     * Lazy([1, 2, 3]).chunk(1) // sequence: [[1], [2], [3]]
     * Lazy([1, 2, 3]).chunk(4) // sequence: [[1, 2, 3]]
     * Lazy([1, 2, 3]).chunk(0) // throws
     */
    Sequence.prototype.chunk = function chunk(size) {
      if (size < 1) {
        throw new Error("You must specify a positive chunk size.");
      }

      return new ChunkedSequence(this, size);
    };

    /**
     * @constructor
     */
    function ChunkedSequence(parent, size) {
      this.parent    = parent;
      this.chunkSize = size;
    }

    ChunkedSequence.prototype = new Sequence();

    ChunkedSequence.prototype.getIterator = function getIterator() {
      return new ChunkedIterator(this.parent, this.chunkSize);
    };

    /**
     * @constructor
     */
    function ChunkedIterator(sequence, size) {
      this.iterator = sequence.getIterator();
      this.size     = size;
    }

    ChunkedIterator.prototype.current = function current() {
      return this.currentChunk;
    };

    ChunkedIterator.prototype.moveNext = function moveNext() {
      var iterator  = this.iterator,
          chunkSize = this.size,
          chunk     = [];

      while (chunk.length < chunkSize && iterator.moveNext()) {
        chunk.push(iterator.current());
      }

      if (chunk.length === 0) {
        return false;
      }

      this.currentChunk = chunk;
      return true;
    };

    /**
     * Passes each element in the sequence to the specified callback during
     * iteration. This is like {@link Sequence#each}, except that it can be
     * inserted anywhere in the middle of a chain of methods to "intercept" the
     * values in the sequence at that point.
     *
     * @public
     * @param {Function} callback A function to call on every element in the
     *     sequence during iteration. The return value of this function does not
     *     matter.
     * @returns {Sequence} A sequence comprising the same elements as this one.
     *
     * @examples
     * Lazy([1, 2, 3]).tap(fn).each(Lazy.noop); // calls fn 3 times
     */
    Sequence.prototype.tap = function tap(callback) {
      return new TappedSequence(this, callback);
    };

    /**
     * @constructor
     */
    function TappedSequence(parent, callback) {
      this.parent = parent;
      this.callback = callback;
    }

    TappedSequence.prototype = new Sequence();

    TappedSequence.prototype.each = function each(fn) {
      var callback = this.callback;
      return this.parent.each(function(e, i) {
        callback(e, i);
        return fn(e, i);
      });
    };

    /**
     * Seaches for the first element in the sequence satisfying a given predicate.
     *
     * @public
     * @aka detect
     * @param {Function} predicate A function to call on (potentially) every element
     *     in the sequence.
     * @returns {*} The first element in the sequence for which `predicate` returns
     *     `true`, or `undefined` if no such element is found.
     *
     * @examples
     * function divisibleBy3(x) {
     *   return x % 3 === 0;
     * }
     *
     * var numbers = [5, 6, 7, 8, 9, 10];
     *
     * Lazy(numbers).find(divisibleBy3) // => 6
     * Lazy(numbers).find(isNegative)   // => undefined
     */
    Sequence.prototype.find = function find(predicate) {
      return this.filter(predicate).first();
    };

    Sequence.prototype.detect = function detect(predicate) {
      return this.find(predicate);
    };

    /**
     * Gets the minimum value in the sequence.
     *
     * @public
     * @param {Function=} valueFn The function by which the value for comparison is
     *     calculated for each element in the sequence.
     * @returns {*} The element with the lowest value in the sequence, or
     *     `Infinity` if the sequence is empty.
     *
     * @examples
     * function negate(x) { return x * -1; }
     *
     * Lazy([]).min()                       // => Infinity
     * Lazy([6, 18, 2, 49, 34]).min()       // => 2
     * Lazy([6, 18, 2, 49, 34]).min(negate) // => 49
     */
    Sequence.prototype.min = function min(valueFn) {
      if (typeof valueFn !== "undefined") {
        return this.minBy(valueFn);
      }

      return this.reduce(function(x, y) { return y < x ? y : x; }, Infinity);
    };

    Sequence.prototype.minBy = function minBy(valueFn) {
      valueFn = createCallback(valueFn);
      return this.reduce(function(x, y) { return valueFn(y) < valueFn(x) ? y : x; });
    };

    /**
     * Gets the maximum value in the sequence.
     *
     * @public
     * @param {Function=} valueFn The function by which the value for comparison is
     *     calculated for each element in the sequence.
     * @returns {*} The element with the highest value in the sequence, or
     *     `-Infinity` if the sequence is empty.
     *
     * @examples
     * function reverseDigits(x) {
     *   return Number(String(x).split('').reverse().join(''));
     * }
     *
     * Lazy([]).max()                              // => -Infinity
     * Lazy([6, 18, 2, 48, 29]).max()              // => 48
     * Lazy([6, 18, 2, 48, 29]).max(reverseDigits) // => 29
     */
    Sequence.prototype.max = function max(valueFn) {
      if (typeof valueFn !== "undefined") {
        return this.maxBy(valueFn);
      }

      return this.reduce(function(x, y) { return y > x ? y : x; }, -Infinity);
    };

    Sequence.prototype.maxBy = function maxBy(valueFn) {
      valueFn = createCallback(valueFn);
      return this.reduce(function(x, y) { return valueFn(y) > valueFn(x) ? y : x; });
    };

    /**
     * Gets the sum of the values in the sequence.
     *
     * @public
     * @param {Function=} valueFn The function used to select the values that will
     *     be summed up.
     * @returns {*} The sum.
     *
     * @examples
     * Lazy([]).sum()                     // => 0
     * Lazy([1, 2, 3, 4]).sum()           // => 10
     * Lazy([1.2, 3.4]).sum(Math.floor)   // => 4
     * Lazy(['foo', 'bar']).sum('length') // => 6
     */
    Sequence.prototype.sum = function sum(valueFn) {
      if (typeof valueFn !== "undefined") {
        return this.sumBy(valueFn);
      }

      return this.reduce(function(x, y) { return x + y; }, 0);
    };

    Sequence.prototype.sumBy = function sumBy(valueFn) {
      valueFn = createCallback(valueFn);
      return this.reduce(function(x, y) { return x + valueFn(y); }, 0);
    };

    /**
     * Creates a string from joining together all of the elements in this sequence,
     * separated by the given delimiter.
     *
     * @public
     * @aka toString
     * @param {string=} delimiter The separator to insert between every element from
     *     this sequence in the resulting string (defaults to `","`).
     * @returns {string} The delimited string.
     *
     * @examples
     * Lazy([6, 29, 1984]).join("/")  // => "6/29/1984"
     * Lazy(["a", "b", "c"]).join()   // => "a,b,c"
     * Lazy(["a", "b", "c"]).join("") // => "abc"
     * Lazy([1, 2, 3]).join()         // => "1,2,3"
     * Lazy([1, 2, 3]).join("")       // => "123"
     * Lazy(["", "", ""]).join(",")   // => ",,"
     */
    Sequence.prototype.join = function join(delimiter) {
      delimiter = typeof delimiter === "string" ? delimiter : ",";

      return this.reduce(function(str, e, i) {
        if (i > 0) {
          str += delimiter;
        }
        return str + e;
      }, "");
    };

    Sequence.prototype.toString = function toString(delimiter) {
      return this.join(delimiter);
    };

    /**
     * Creates a sequence, with the same elements as this one, that will be iterated
     * over asynchronously when calling `each`.
     *
     * @public
     * @param {number=} interval The approximate period, in milliseconds, that
     *     should elapse between each element in the resulting sequence. Omitting
     *     this argument will result in the fastest possible asynchronous iteration.
     * @returns {AsyncSequence} The new asynchronous sequence.
     *
     * @examples
     * Lazy([1, 2, 3]).async(100).each(fn) // calls fn 3 times asynchronously
     */
    Sequence.prototype.async = function async(interval) {
      return new AsyncSequence(this, interval);
    };

    /**
     * @constructor
     */
    function SimpleIntersectionSequence(parent, array) {
      this.parent = parent;
      this.array  = array;
      this.each   = getEachForIntersection(array);
    }

    SimpleIntersectionSequence.prototype = new Sequence();

    SimpleIntersectionSequence.prototype.eachMemoizerCache = function eachMemoizerCache(fn) {
      var iterator = new UniqueMemoizer(Lazy(this.array).getIterator()),
          i = 0;

      return this.parent.each(function(e) {
        if (iterator.contains(e)) {
          return fn(e, i++);
        }
      });
    };

    SimpleIntersectionSequence.prototype.eachArrayCache = function eachArrayCache(fn) {
      var array = this.array,
          find  = arrayContains,
          i = 0;

      return this.parent.each(function(e) {
        if (find(array, e)) {
          return fn(e, i++);
        }
      });
    };

    function getEachForIntersection(source) {
      if (source.length < 40) {
        return SimpleIntersectionSequence.prototype.eachArrayCache;
      } else {
        return SimpleIntersectionSequence.prototype.eachMemoizerCache;
      }
    }

    /**
     * An optimized version of {@link ZippedSequence}, when zipping a sequence with
     * only one array.
     *
     * @param {Sequence} parent The underlying sequence.
     * @param {Array} array The array with which to zip the sequence.
     * @constructor
     */
    function SimpleZippedSequence(parent, array) {
      this.parent = parent;
      this.array  = array;
    }

    SimpleZippedSequence.prototype = new Sequence();

    SimpleZippedSequence.prototype.each = function each(fn) {
      var array = this.array;
      return this.parent.each(function(e, i) {
        return fn([e, array[i]], i);
      });
    };

    /**
     * An `ArrayLikeSequence` is a {@link Sequence} that provides random access to
     * its elements. This extends the API for iterating with the additional methods
     * {@link #get} and {@link #length}, allowing a sequence to act as a "view" into
     * a collection or other indexed data source.
     *
     * The initial sequence created by wrapping an array with `Lazy(array)` is an
     * `ArrayLikeSequence`.
     *
     * All methods of `ArrayLikeSequence` that conceptually should return
     * something like a array (with indexed access) return another
     * `ArrayLikeSequence`, for example:
     *
     * - {@link Sequence#map}
     * - {@link ArrayLikeSequence#slice}
     * - {@link Sequence#take} and {@link Sequence#drop}
     * - {@link Sequence#reverse}
     *
     * The above is not an exhaustive list. There are also certain other cases
     * where it might be possible to return an `ArrayLikeSequence` (e.g., calling
     * {@link Sequence#concat} with a single array argument), but this is not
     * guaranteed by the API.
     *
     * Note that in many cases, it is not possible to provide indexed access
     * without first performing at least a partial iteration of the underlying
     * sequence. In these cases an `ArrayLikeSequence` will not be returned:
     *
     * - {@link Sequence#filter}
     * - {@link Sequence#uniq}
     * - {@link Sequence#union}
     * - {@link Sequence#intersect}
     *
     * etc. The above methods only return ordinary {@link Sequence} objects.
     *
     * Defining custom array-like sequences
     * ------------------------------------
     *
     * Creating a custom `ArrayLikeSequence` is essentially the same as creating a
     * custom {@link Sequence}. You just have a couple more methods you need to
     * implement: `get` and (optionally) `length`.
     *
     * Here's an example. Let's define a sequence type called `OffsetSequence` that
     * offsets each of its parent's elements by a set distance, and circles back to
     * the beginning after reaching the end. **Remember**: the initialization
     * function you pass to {@link #define} should always accept a `parent` as its
     * first parameter.
     *
     *     ArrayLikeSequence.define("offset", {
     *       init: function(parent, offset) {
     *         this.offset = offset;
     *       },
     *
     *       get: function(i) {
     *         return this.parent.get((i + this.offset) % this.parent.length());
     *       }
     *     });
     *
     * It's worth noting a couple of things here.
     *
     * First, Lazy's default implementation of `length` simply returns the parent's
     * length. In this case, since an `OffsetSequence` will always have the same
     * number of elements as its parent, that implementation is fine; so we don't
     * need to override it.
     *
     * Second, the default implementation of `each` uses `get` and `length` to
     * essentially create a `for` loop, which is fine here. If you want to implement
     * `each` your own way, you can do that; but in most cases (as here), you can
     * probably just stick with the default.
     *
     * So we're already done, after only implementing `get`! Pretty easy, huh?
     *
     * Now the `offset` method will be chainable from any `ArrayLikeSequence`. So
     * for example:
     *
     *     Lazy([1, 2, 3]).map(mapFn).offset(3);
     *
     * ...will work, but:
     *
     *     Lazy([1, 2, 3]).filter(mapFn).offset(3);
     *
     * ...will not (because `filter` does not return an `ArrayLikeSequence`).
     *
     * (Also, as with the example provided for defining custom {@link Sequence}
     * types, this example really could have been implemented using a function
     * already available as part of Lazy.js: in this case, {@link Sequence#map}.)
     *
     * @public
     * @constructor
     *
     * @examples
     * Lazy([1, 2, 3])                    // instanceof Lazy.ArrayLikeSequence
     * Lazy([1, 2, 3]).map(Lazy.identity) // instanceof Lazy.ArrayLikeSequence
     * Lazy([1, 2, 3]).take(2)            // instanceof Lazy.ArrayLikeSequence
     * Lazy([1, 2, 3]).drop(2)            // instanceof Lazy.ArrayLikeSequence
     * Lazy([1, 2, 3]).reverse()          // instanceof Lazy.ArrayLikeSequence
     * Lazy([1, 2, 3]).slice(1, 2)        // instanceof Lazy.ArrayLikeSequence
     */
    function ArrayLikeSequence() {}

    ArrayLikeSequence.prototype = new Sequence();

    /**
     * Create a new constructor function for a type inheriting from
     * `ArrayLikeSequence`.
     *
     * @public
     * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
     *     used for constructing the new sequence. The method will be attached to
     *     the `ArrayLikeSequence` prototype so that it can be chained with any other
     *     methods that return array-like sequences.
     * @param {Object} overrides An object containing function overrides for this
     *     new sequence type. **Must** include `get`. *May* include `init`,
     *     `length`, `getIterator`, and `each`. For each function, `this` will be
     *     the new sequence and `this.parent` will be the source sequence.
     * @returns {Function} A constructor for a new type inheriting from
     *     `ArrayLikeSequence`.
     *
     * @examples
     * Lazy.ArrayLikeSequence.define("offset", {
     *   init: function(offset) {
     *     this.offset = offset;
     *   },
     *
     *   get: function(i) {
     *     return this.parent.get((i + this.offset) % this.parent.length());
     *   }
     * });
     *
     * Lazy([1, 2, 3]).offset(1) // sequence: [2, 3, 1]
     */
    ArrayLikeSequence.define = function define(methodName, overrides) {
      if (!overrides || typeof overrides.get !== 'function') {
        throw new Error("A custom array-like sequence must implement *at least* get!");
      }

      return defineSequenceType(ArrayLikeSequence, methodName, overrides);
    };

    /**
     * Returns the element at the specified index.
     *
     * @public
     * @param {number} i The index to access.
     * @returns {*} The element.
     *
     * @examples
     * function increment(x) { return x + 1; }
     *
     * Lazy([1, 2, 3]).get(1)                // => 2
     * Lazy([1, 2, 3]).get(-1)               // => undefined
     * Lazy([1, 2, 3]).map(increment).get(1) // => 3
     */
    ArrayLikeSequence.prototype.get = function get(i) {
      return this.parent.get(i);
    };

    /**
     * Returns the length of the sequence.
     *
     * @public
     * @returns {number} The length.
     *
     * @examples
     * function increment(x) { return x + 1; }
     *
     * Lazy([]).length()                       // => 0
     * Lazy([1, 2, 3]).length()                // => 3
     * Lazy([1, 2, 3]).map(increment).length() // => 3
     */
    ArrayLikeSequence.prototype.length = function length() {
      return this.parent.length();
    };

    /**
     * Returns the current sequence (since it is already indexed).
     */
    ArrayLikeSequence.prototype.getIndex = function getIndex() {
      return this;
    };

    /**
     * An optimized version of {@link Sequence#getIterator}.
     */
    ArrayLikeSequence.prototype.getIterator = function getIterator() {
      return new IndexedIterator(this);
    };

    /**
     * An optimized version of {@link Iterator} meant to work with already-indexed
     * sequences.
     *
     * @param {ArrayLikeSequence} sequence The sequence to iterate over.
     * @constructor
     */
    function IndexedIterator(sequence) {
      this.sequence = sequence;
      this.index    = -1;
    }

    IndexedIterator.prototype.current = function current() {
      return this.sequence.get(this.index);
    };

    IndexedIterator.prototype.moveNext = function moveNext() {
      if (this.index >= this.sequence.length() - 1) {
        return false;
      }

      ++this.index;
      return true;
    };

    /**
     * An optimized version of {@link Sequence#each}.
     */
    ArrayLikeSequence.prototype.each = function each(fn) {
      var length = this.length(),
          i = -1;

      while (++i < length) {
        if (fn(this.get(i), i) === false) {
          return false;
        }
      }

      return true;
    };

    /**
     * Returns a new sequence with the same elements as this one, minus the last
     * element.
     *
     * @public
     * @returns {ArrayLikeSequence} The new array-like sequence.
     *
     * @examples
     * Lazy([1, 2, 3]).pop() // sequence: [1, 2]
     * Lazy([]).pop()        // sequence: []
     */
    ArrayLikeSequence.prototype.pop = function pop() {
      return this.initial();
    };

    /**
     * Returns a new sequence with the same elements as this one, minus the first
     * element.
     *
     * @public
     * @returns {ArrayLikeSequence} The new array-like sequence.
     *
     * @examples
     * Lazy([1, 2, 3]).shift() // sequence: [2, 3]
     * Lazy([]).shift()        // sequence: []
     */
    ArrayLikeSequence.prototype.shift = function shift() {
      return this.drop();
    };

    /**
     * Returns a new sequence comprising the portion of this sequence starting
     * from the specified starting index and continuing until the specified ending
     * index or to the end of the sequence.
     *
     * @public
     * @param {number} begin The index at which the new sequence should start.
     * @param {number=} end The index at which the new sequence should end.
     * @returns {ArrayLikeSequence} The new array-like sequence.
     *
     * @examples
     * Lazy([1, 2, 3, 4, 5]).slice(0)     // sequence: [1, 2, 3, 4, 5]
     * Lazy([1, 2, 3, 4, 5]).slice(2)     // sequence: [3, 4, 5]
     * Lazy([1, 2, 3, 4, 5]).slice(2, 4)  // sequence: [3, 4]
     * Lazy([1, 2, 3, 4, 5]).slice(-1)    // sequence: [5]
     * Lazy([1, 2, 3, 4, 5]).slice(1, -1) // sequence: [2, 3, 4]
     * Lazy([1, 2, 3, 4, 5]).slice(0, 10) // sequence: [1, 2, 3, 4, 5]
     */
    ArrayLikeSequence.prototype.slice = function slice(begin, end) {
      var length = this.length();

      if (begin < 0) {
        begin = length + begin;
      }

      var result = this.drop(begin);

      if (typeof end === "number") {
        if (end < 0) {
          end = length + end;
        }
        result = result.take(end - begin);
      }

      return result;
    };

    /**
     * An optimized version of {@link Sequence#map}, which creates an
     * {@link ArrayLikeSequence} so that the result still provides random access.
     *
     * @public
     *
     * @examples
     * Lazy([1, 2, 3]).map(Lazy.identity) // instanceof Lazy.ArrayLikeSequence
     */
    ArrayLikeSequence.prototype.map = function map(mapFn) {
      return new IndexedMappedSequence(this, createCallback(mapFn));
    };

    /**
     * @constructor
     */
    function IndexedMappedSequence(parent, mapFn) {
      this.parent = parent;
      this.mapFn  = mapFn;
    }

    IndexedMappedSequence.prototype = new ArrayLikeSequence();

    IndexedMappedSequence.prototype.get = function get(i) {
      if (i < 0 || i >= this.parent.length()) {
        return undefined;
      }

      return this.mapFn(this.parent.get(i), i);
    };

    /**
     * An optimized version of {@link Sequence#filter}.
     */
    ArrayLikeSequence.prototype.filter = function filter(filterFn) {
      return new IndexedFilteredSequence(this, createCallback(filterFn));
    };

    /**
     * @constructor
     */
    function IndexedFilteredSequence(parent, filterFn) {
      this.parent   = parent;
      this.filterFn = filterFn;
    }

    IndexedFilteredSequence.prototype = new FilteredSequence();

    IndexedFilteredSequence.prototype.each = function each(fn) {
      var parent = this.parent,
          filterFn = this.filterFn,
          length = this.parent.length(),
          i = -1,
          j = 0,
          e;

      while (++i < length) {
        e = parent.get(i);
        if (filterFn(e, i) && fn(e, j++) === false) {
          return false;
        }
      }

      return true;
    };

    /**
     * An optimized version of {@link Sequence#reverse}, which creates an
     * {@link ArrayLikeSequence} so that the result still provides random access.
     *
     * @public
     *
     * @examples
     * Lazy([1, 2, 3]).reverse() // instanceof Lazy.ArrayLikeSequence
     */
    ArrayLikeSequence.prototype.reverse = function reverse() {
      return new IndexedReversedSequence(this);
    };

    /**
     * @constructor
     */
    function IndexedReversedSequence(parent) {
      this.parent = parent;
    }

    IndexedReversedSequence.prototype = new ArrayLikeSequence();

    IndexedReversedSequence.prototype.get = function get(i) {
      return this.parent.get(this.length() - i - 1);
    };

    /**
     * An optimized version of {@link Sequence#first}, which creates an
     * {@link ArrayLikeSequence} so that the result still provides random access.
     *
     * @public
     *
     * @examples
     * Lazy([1, 2, 3]).first(2) // instanceof Lazy.ArrayLikeSequence
     */
    ArrayLikeSequence.prototype.first = function first(count) {
      if (typeof count === "undefined") {
        return this.get(0);
      }

      return new IndexedTakeSequence(this, count);
    };

    /**
     * @constructor
     */
    function IndexedTakeSequence(parent, count) {
      this.parent = parent;
      this.count  = count;
    }

    IndexedTakeSequence.prototype = new ArrayLikeSequence();

    IndexedTakeSequence.prototype.length = function length() {
      var parentLength = this.parent.length();
      return this.count <= parentLength ? this.count : parentLength;
    };

    /**
     * An optimized version of {@link Sequence#rest}, which creates an
     * {@link ArrayLikeSequence} so that the result still provides random access.
     *
     * @public
     *
     * @examples
     * Lazy([1, 2, 3]).rest() // instanceof Lazy.ArrayLikeSequence
     */
    ArrayLikeSequence.prototype.rest = function rest(count) {
      return new IndexedDropSequence(this, count);
    };

    /**
     * @constructor
     */
    function IndexedDropSequence(parent, count) {
      this.parent = parent;
      this.count  = typeof count === "number" ? count : 1;
    }

    IndexedDropSequence.prototype = new ArrayLikeSequence();

    IndexedDropSequence.prototype.get = function get(i) {
      return this.parent.get(this.count + i);
    };

    IndexedDropSequence.prototype.length = function length() {
      var parentLength = this.parent.length();
      return this.count <= parentLength ? parentLength - this.count : 0;
    };

    /**
     * An optimized version of {@link Sequence#concat} that returns another
     * {@link ArrayLikeSequence} *if* the argument is an array.
     *
     * @public
     * @param {...*} var_args
     *
     * @examples
     * Lazy([1, 2]).concat([3, 4]) // instanceof Lazy.ArrayLikeSequence
     * Lazy([1, 2]).concat([3, 4]) // sequence: [1, 2, 3, 4]
     */
    ArrayLikeSequence.prototype.concat = function concat(var_args) {
      if (arguments.length === 1 && arguments[0] instanceof Array) {
        return new IndexedConcatenatedSequence(this, (/** @type {Array} */ var_args));
      } else {
        return Sequence.prototype.concat.apply(this, arguments);
      }
    };

    /**
     * @constructor
     */
    function IndexedConcatenatedSequence(parent, other) {
      this.parent = parent;
      this.other  = other;
    }

    IndexedConcatenatedSequence.prototype = new ArrayLikeSequence();

    IndexedConcatenatedSequence.prototype.get = function get(i) {
      var parentLength = this.parent.length();
      if (i < parentLength) {
        return this.parent.get(i);
      } else {
        return this.other[i - parentLength];
      }
    };

    IndexedConcatenatedSequence.prototype.length = function length() {
      return this.parent.length() + this.other.length;
    };

    /**
     * An optimized version of {@link Sequence#uniq}.
     */
    ArrayLikeSequence.prototype.uniq = function uniq(keyFn) {
      return new IndexedUniqueSequence(this, createCallback(keyFn));
    };

    /**
     * @param {ArrayLikeSequence} parent
     * @constructor
     */
    function IndexedUniqueSequence(parent, keyFn) {
      this.parent = parent;
      this.each   = getEachForParent(parent);
      this.keyFn  = keyFn;
    }

    IndexedUniqueSequence.prototype = new Sequence();

    IndexedUniqueSequence.prototype.eachArrayCache = function eachArrayCache(fn) {
      // Basically the same implementation as w/ the set, but using an array because
      // it's cheaper for smaller sequences.
      var parent = this.parent,
          keyFn  = this.keyFn,
          length = parent.length(),
          cache  = [],
          find   = arrayContains,
          key, value,
          i = -1,
          j = 0;

      while (++i < length) {
        value = parent.get(i);
        key = keyFn(value);
        if (!find(cache, key)) {
          cache.push(key);
          if (fn(value, j++) === false) {
            return false;
          }
        }
      }
    };

    IndexedUniqueSequence.prototype.eachSetCache = UniqueSequence.prototype.each;

    function getEachForParent(parent) {
      if (parent.length() < 100) {
        return IndexedUniqueSequence.prototype.eachArrayCache;
      } else {
        return UniqueSequence.prototype.each;
      }
    }

    // Now that we've fully initialized the ArrayLikeSequence prototype, we can
    // set the prototype for MemoizedSequence.

    MemoizedSequence.prototype = new ArrayLikeSequence();

    MemoizedSequence.prototype.cache = function cache() {
      return this.cachedResult || (this.cachedResult = this.parent.toArray());
    };

    MemoizedSequence.prototype.get = function get(i) {
      return this.cache()[i];
    };

    MemoizedSequence.prototype.length = function length() {
      return this.cache().length;
    };

    MemoizedSequence.prototype.slice = function slice(begin, end) {
      return this.cache().slice(begin, end);
    };

    MemoizedSequence.prototype.toArray = function toArray() {
      return this.cache().slice(0);
    };

    /**
     * ArrayWrapper is the most basic {@link Sequence}. It directly wraps an array
     * and implements the same methods as {@link ArrayLikeSequence}, but more
     * efficiently.
     *
     * @constructor
     */
    function ArrayWrapper(source) {
      this.source = source;
    }

    ArrayWrapper.prototype = new ArrayLikeSequence();

    ArrayWrapper.prototype.root = function root() {
      return this;
    };

    ArrayWrapper.prototype.isAsync = function isAsync() {
      return false;
    };

    /**
     * Returns the element at the specified index in the source array.
     *
     * @param {number} i The index to access.
     * @returns {*} The element.
     */
    ArrayWrapper.prototype.get = function get(i) {
      return this.source[i];
    };

    /**
     * Returns the length of the source array.
     *
     * @returns {number} The length.
     */
    ArrayWrapper.prototype.length = function length() {
      return this.source.length;
    };

    /**
     * An optimized version of {@link Sequence#each}.
     */
    ArrayWrapper.prototype.each = function each(fn) {
      return forEach(this.source, fn);
    };

    /**
     * An optimized version of {@link Sequence#map}.
     */
    ArrayWrapper.prototype.map = function map(mapFn) {
      return new MappedArrayWrapper(this, createCallback(mapFn));
    };

    /**
     * An optimized version of {@link Sequence#filter}.
     */
    ArrayWrapper.prototype.filter = function filter(filterFn) {
      return new FilteredArrayWrapper(this, createCallback(filterFn));
    };

    /**
     * An optimized version of {@link Sequence#uniq}.
     */
    ArrayWrapper.prototype.uniq = function uniq(keyFn) {
      return new UniqueArrayWrapper(this, keyFn);
    };

    /**
     * An optimized version of {@link ArrayLikeSequence#concat}.
     *
     * @param {...*} var_args
     */
    ArrayWrapper.prototype.concat = function concat(var_args) {
      if (arguments.length === 1 && arguments[0] instanceof Array) {
        return new ConcatArrayWrapper(this, (/** @type {Array} */ var_args));
      } else {
        return ArrayLikeSequence.prototype.concat.apply(this, arguments);
      }
    };

    /**
     * An optimized version of {@link Sequence#toArray}.
     */
    ArrayWrapper.prototype.toArray = function toArray() {
      return this.source.slice(0);
    };

    /**
     * @constructor
     */
    function MappedArrayWrapper(parent, mapFn) {
      this.parent = parent;
      this.mapFn  = mapFn;
    }

    MappedArrayWrapper.prototype = new ArrayLikeSequence();

    MappedArrayWrapper.prototype.get = function get(i) {
      var source = this.parent.source;

      if (i < 0 || i >= source.length) {
        return undefined;
      }

      return this.mapFn(source[i]);
    };

    MappedArrayWrapper.prototype.length = function length() {
      return this.parent.source.length;
    };

    MappedArrayWrapper.prototype.each = function each(fn) {
      var source = this.parent.source,
          length = source.length,
          mapFn  = this.mapFn,
          i = -1;

      while (++i < length) {
        if (fn(mapFn(source[i], i), i) === false) {
          return false;
        }
      }

      return true;
    };

    /**
     * @constructor
     */
    function FilteredArrayWrapper(parent, filterFn) {
      this.parent   = parent;
      this.filterFn = filterFn;
    }

    FilteredArrayWrapper.prototype = new FilteredSequence();

    FilteredArrayWrapper.prototype.each = function each(fn) {
      var source = this.parent.source,
          filterFn = this.filterFn,
          length = source.length,
          i = -1,
          j = 0,
          e;

      while (++i < length) {
        e = source[i];
        if (filterFn(e, i) && fn(e, j++) === false) {
          return false;
        }
      }

      return true;
    };

    /**
     * @constructor
     */
    function UniqueArrayWrapper(parent, keyFn) {
      this.parent = parent;
      this.each   = getEachForSource(parent.source);
      this.keyFn  = keyFn;
    }

    UniqueArrayWrapper.prototype = new Sequence();

    UniqueArrayWrapper.prototype.eachNoCache = function eachNoCache(fn) {
      var source = this.parent.source,
          keyFn  = this.keyFn,
          length = source.length,
          find   = arrayContainsBefore,
          value,

          // Yes, this is hideous.
          // Trying to get performance first, will refactor next!
          i = -1,
          k = 0;

      while (++i < length) {
        value = source[i];
        if (!find(source, value, i, keyFn) && fn(value, k++) === false) {
          return false;
        }
      }

      return true;
    };

    UniqueArrayWrapper.prototype.eachArrayCache = function eachArrayCache(fn) {
      // Basically the same implementation as w/ the set, but using an array because
      // it's cheaper for smaller sequences.
      var source = this.parent.source,
          keyFn  = this.keyFn,
          length = source.length,
          cache  = [],
          find   = arrayContains,
          key, value,
          i = -1,
          j = 0;

      if (keyFn) {
        keyFn = createCallback(keyFn);
        while (++i < length) {
          value = source[i];
          key = keyFn(value);
          if (!find(cache, key)) {
            cache.push(key);
            if (fn(value, j++) === false) {
              return false;
            }
          }
        }

      } else {
        while (++i < length) {
          value = source[i];
          if (!find(cache, value)) {
            cache.push(value);
            if (fn(value, j++) === false) {
              return false;
            }
          }
        }
      }

      return true;
    };

    UniqueArrayWrapper.prototype.eachSetCache = UniqueSequence.prototype.each;

    /**
     * My latest findings here...
     *
     * So I hadn't really given the set-based approach enough credit. The main issue
     * was that my Set implementation was totally not optimized at all. After pretty
     * heavily optimizing it (just take a look; it's a monstrosity now!), it now
     * becomes the fastest option for much smaller values of N.
     */
    function getEachForSource(source) {
      if (source.length < 40) {
        return UniqueArrayWrapper.prototype.eachNoCache;
      } else if (source.length < 100) {
        return UniqueArrayWrapper.prototype.eachArrayCache;
      } else {
        return UniqueArrayWrapper.prototype.eachSetCache;
      }
    }

    /**
     * @constructor
     */
    function ConcatArrayWrapper(parent, other) {
      this.parent = parent;
      this.other  = other;
    }

    ConcatArrayWrapper.prototype = new ArrayLikeSequence();

    ConcatArrayWrapper.prototype.get = function get(i) {
      var source = this.parent.source,
          sourceLength = source.length;

      if (i < sourceLength) {
        return source[i];
      } else {
        return this.other[i - sourceLength];
      }
    };

    ConcatArrayWrapper.prototype.length = function length() {
      return this.parent.source.length + this.other.length;
    };

    ConcatArrayWrapper.prototype.each = function each(fn) {
      var source = this.parent.source,
          sourceLength = source.length,
          other = this.other,
          otherLength = other.length,
          i = 0,
          j = -1;

      while (++j < sourceLength) {
        if (fn(source[j], i++) === false) {
          return false;
        }
      }

      j = -1;
      while (++j < otherLength) {
        if (fn(other[j], i++) === false) {
          return false;
        }
      }

      return true;
    };

    /**
     * An `ObjectLikeSequence` object represents a sequence of key/value pairs.
     *
     * The initial sequence you get by wrapping an object with `Lazy(object)` is
     * an `ObjectLikeSequence`.
     *
     * All methods of `ObjectLikeSequence` that conceptually should return
     * something like an object return another `ObjectLikeSequence`.
     *
     * @public
     * @constructor
     *
     * @examples
     * var obj = { foo: 'bar' };
     *
     * Lazy(obj).assign({ bar: 'baz' })   // instanceof Lazy.ObjectLikeSequence
     * Lazy(obj).defaults({ bar: 'baz' }) // instanceof Lazy.ObjectLikeSequence
     * Lazy(obj).invert()                 // instanceof Lazy.ObjectLikeSequence
     */
    function ObjectLikeSequence() {}

    ObjectLikeSequence.prototype = new Sequence();

    /**
     * Create a new constructor function for a type inheriting from
     * `ObjectLikeSequence`.
     *
     * @public
     * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
     *     used for constructing the new sequence. The method will be attached to
     *     the `ObjectLikeSequence` prototype so that it can be chained with any other
     *     methods that return object-like sequences.
     * @param {Object} overrides An object containing function overrides for this
     *     new sequence type. **Must** include `each`. *May* include `init` and
     *     `get` (for looking up an element by key).
     * @returns {Function} A constructor for a new type inheriting from
     *     `ObjectLikeSequence`.
     *
     * @examples
     * function downcaseKey(value, key) {
     *   return [key.toLowerCase(), value];
     * }
     *
     * Lazy.ObjectLikeSequence.define("caseInsensitive", {
     *   init: function() {
     *     var downcased = this.parent
     *       .map(downcaseKey)
     *       .toObject();
     *     this.downcased = Lazy(downcased);
     *   },
     *
     *   get: function(key) {
     *     return this.downcased.get(key.toLowerCase());
     *   },
     *
     *   each: function(fn) {
     *     return this.downcased.each(fn);
     *   }
     * });
     *
     * Lazy({ Foo: 'bar' }).caseInsensitive()            // sequence: { foo: 'bar' }
     * Lazy({ FOO: 'bar' }).caseInsensitive().get('foo') // => 'bar'
     * Lazy({ FOO: 'bar' }).caseInsensitive().get('FOO') // => 'bar'
     */
    ObjectLikeSequence.define = function define(methodName, overrides) {
      if (!overrides || typeof overrides.each !== 'function') {
        throw new Error("A custom object-like sequence must implement *at least* each!");
      }

      return defineSequenceType(ObjectLikeSequence, methodName, overrides);
    };

    ObjectLikeSequence.prototype.value = function value() {
      return this.toObject();
    };

    /**
     * Gets the element at the specified key in this sequence.
     *
     * @public
     * @param {string} key The key.
     * @returns {*} The element.
     *
     * @examples
     * Lazy({ foo: "bar" }).get("foo")                          // => "bar"
     * Lazy({ foo: "bar" }).extend({ foo: "baz" }).get("foo")   // => "baz"
     * Lazy({ foo: "bar" }).defaults({ bar: "baz" }).get("bar") // => "baz"
     * Lazy({ foo: "bar" }).invert().get("bar")                 // => "foo"
     * Lazy({ foo: 1, bar: 2 }).pick(["foo"]).get("foo")        // => 1
     * Lazy({ foo: 1, bar: 2 }).pick(["foo"]).get("bar")        // => undefined
     * Lazy({ foo: 1, bar: 2 }).omit(["foo"]).get("bar")        // => 2
     * Lazy({ foo: 1, bar: 2 }).omit(["foo"]).get("foo")        // => undefined
     */
    ObjectLikeSequence.prototype.get = function get(key) {
      var pair = this.pairs().find(function(pair) {
        return pair[0] === key;
      });

      return pair ? pair[1] : undefined;
    };

    /**
     * Returns a {@link Sequence} whose elements are the keys of this object-like
     * sequence.
     *
     * @public
     * @returns {Sequence} The sequence based on this sequence's keys.
     *
     * @examples
     * Lazy({ hello: "hola", goodbye: "hasta luego" }).keys() // sequence: ["hello", "goodbye"]
     */
    ObjectLikeSequence.prototype.keys = function keys() {
      return this.map(function(v, k) { return k; });
    };

    /**
     * Returns a {@link Sequence} whose elements are the values of this object-like
     * sequence.
     *
     * @public
     * @returns {Sequence} The sequence based on this sequence's values.
     *
     * @examples
     * Lazy({ hello: "hola", goodbye: "hasta luego" }).values() // sequence: ["hola", "hasta luego"]
     */
    ObjectLikeSequence.prototype.values = function values() {
      return this.map(function(v, k) { return v; });
    };

    /**
     * Throws an exception. Asynchronous iteration over object-like sequences is
     * not supported.
     *
     * @public
     * @examples
     * Lazy({ foo: 'bar' }).async() // throws
     */
    ObjectLikeSequence.prototype.async = function async() {
      throw new Error('An ObjectLikeSequence does not support asynchronous iteration.');
    };

    ObjectLikeSequence.prototype.filter = function filter(filterFn) {
      return new FilteredObjectLikeSequence(this, createCallback(filterFn));
    };

    function FilteredObjectLikeSequence(parent, filterFn) {
      this.parent = parent;
      this.filterFn = filterFn;
    }

    FilteredObjectLikeSequence.prototype = new ObjectLikeSequence();

    FilteredObjectLikeSequence.prototype.each = function each(fn) {
      var filterFn = this.filterFn;

      return this.parent.each(function(v, k) {
        if (filterFn(v, k)) {
          return fn(v, k);
        }
      });
    };

    /**
     * Returns this same sequence. (Reversing an object-like sequence doesn't make
     * any sense.)
     */
    ObjectLikeSequence.prototype.reverse = function reverse() {
      return this;
    };

    /**
     * Returns an {@link ObjectLikeSequence} whose elements are the combination of
     * this sequence and another object. In the case of a key appearing in both this
     * sequence and the given object, the other object's value will override the
     * one in this sequence.
     *
     * @public
     * @aka extend
     * @param {Object} other The other object to assign to this sequence.
     * @returns {ObjectLikeSequence} A new sequence comprising elements from this
     *     sequence plus the contents of `other`.
     *
     * @examples
     * Lazy({ "uno": 1, "dos": 2 }).assign({ "tres": 3 }) // sequence: { uno: 1, dos: 2, tres: 3 }
     * Lazy({ foo: "bar" }).assign({ foo: "baz" });       // sequence: { foo: "baz" }
     */
    ObjectLikeSequence.prototype.assign = function assign(other) {
      return new AssignSequence(this, other);
    };

    ObjectLikeSequence.prototype.extend = function extend(other) {
      return this.assign(other);
    };

    /**
     * @constructor
     */
    function AssignSequence(parent, other) {
      this.parent = parent;
      this.other  = other;
    }

    AssignSequence.prototype = new ObjectLikeSequence();

    AssignSequence.prototype.get = function get(key) {
      return this.other[key] || this.parent.get(key);
    };

    AssignSequence.prototype.each = function each(fn) {
      var merged = new Set(),
          done   = false;

      Lazy(this.other).each(function(value, key) {
        if (fn(value, key) === false) {
          done = true;
          return false;
        }

        merged.add(key);
      });

      if (!done) {
        return this.parent.each(function(value, key) {
          if (!merged.contains(key) && fn(value, key) === false) {
            return false;
          }
        });
      }
    };

    /**
     * Returns an {@link ObjectLikeSequence} whose elements are the combination of
     * this sequence and a 'default' object. In the case of a key appearing in both
     * this sequence and the given object, this sequence's value will override the
     * default object's.
     *
     * @public
     * @param {Object} defaults The 'default' object to use for missing keys in this
     *     sequence.
     * @returns {ObjectLikeSequence} A new sequence comprising elements from this
     *     sequence supplemented by the contents of `defaults`.
     *
     * @examples
     * Lazy({ name: "Dan" }).defaults({ name: "User", password: "passw0rd" }) // sequence: { name: "Dan", password: "passw0rd" }
     */
    ObjectLikeSequence.prototype.defaults = function defaults(defaults) {
      return new DefaultsSequence(this, defaults);
    };

    /**
     * @constructor
     */
    function DefaultsSequence(parent, defaults) {
      this.parent   = parent;
      this.defaults = defaults;
    }

    DefaultsSequence.prototype = new ObjectLikeSequence();

    DefaultsSequence.prototype.get = function get(key) {
      return this.parent.get(key) || this.defaults[key];
    };

    DefaultsSequence.prototype.each = function each(fn) {
      var merged = new Set(),
          done   = false;

      this.parent.each(function(value, key) {
        if (fn(value, key) === false) {
          done = true;
          return false;
        }

        if (typeof value !== "undefined") {
          merged.add(key);
        }
      });

      if (!done) {
        Lazy(this.defaults).each(function(value, key) {
          if (!merged.contains(key) && fn(value, key) === false) {
            return false;
          }
        });
      }
    };

    /**
     * Returns an {@link ObjectLikeSequence} whose values are this sequence's keys,
     * and whose keys are this sequence's values.
     *
     * @public
     * @returns {ObjectLikeSequence} A new sequence comprising the inverted keys and
     *     values from this sequence.
     *
     * @examples
     * Lazy({ first: "Dan", last: "Tao" }).invert() // sequence: { Dan: "first", Tao: "last" }
     */
    ObjectLikeSequence.prototype.invert = function invert() {
      return new InvertedSequence(this);
    };

    /**
     * @constructor
     */
    function InvertedSequence(parent) {
      this.parent = parent;
    }

    InvertedSequence.prototype = new ObjectLikeSequence();

    InvertedSequence.prototype.each = function each(fn) {
      this.parent.each(function(value, key) {
        return fn(key, value);
      });
    };

    /**
     * Produces an {@link ObjectLikeSequence} consisting of all the recursively
     * merged values from this and the given object(s) or sequence(s).
     *
     * Note that by default this method only merges "vanilla" objects (bags of
     * key/value pairs), not arrays or any other custom object types. To customize
     * how merging works, you can provide the mergeFn argument, e.g. to handling
     * merging arrays, strings, or other types of objects.
     *
     * @public
     * @param {...Object|ObjectLikeSequence} others The other object(s) or
     *     sequence(s) whose values will be merged into this one.
     * @param {Function=} mergeFn An optional function used to customize merging
     *     behavior. The function should take two values as parameters and return
     *     whatever the "merged" form of those values is. If the function returns
     *     undefined then the new value will simply replace the old one in the
     *     final result.
     * @returns {ObjectLikeSequence} The new sequence consisting of merged values.
     *
     * @examples
     * // These examples are completely stolen from Lo-Dash's documentation:
     * // lodash.com/docs#merge
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * function mergeArrays(a, b) {
     *   return Array.isArray(a) ? a.concat(b) : undefined;
     * }
     *
     * Lazy(names).merge(ages); // => sequence: { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     * Lazy(food).merge(otherFood, mergeArrays); // => sequence: { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
     *
     * // ----- Now for my own tests: -----
     *
     * // merges objects
     * Lazy({ foo: 1 }).merge({ foo: 2 }); // => sequence: { foo: 2 }
     * Lazy({ foo: 1 }).merge({ bar: 2 }); // => sequence: { foo: 1, bar: 2 }
     *
     * // goes deep
     * Lazy({ foo: { bar: 1 } }).merge({ foo: { bar: 2 } }); // => sequence: { foo: { bar: 2 } }
     * Lazy({ foo: { bar: 1 } }).merge({ foo: { baz: 2 } }); // => sequence: { foo: { bar: 1, baz: 2 } }
     * Lazy({ foo: { bar: 1 } }).merge({ foo: { baz: 2 } }); // => sequence: { foo: { bar: 1, baz: 2 } }
     *
     * // gives precedence to later sources
     * Lazy({ foo: 1 }).merge({ bar: 2 }, { bar: 3 }); // => sequence: { foo: 1, bar: 3 }
     *
     * // undefined gets passed over
     * Lazy({ foo: 1 }).merge({ foo: undefined }); // => sequence: { foo: 1 }
     *
     * // null doesn't get passed over
     * Lazy({ foo: 1 }).merge({ foo: null }); // => sequence: { foo: null }
     *
     * // array contents get merged as well
     * Lazy({ foo: [{ bar: 1 }] }).merge({ foo: [{ baz: 2 }] }); // => sequence: { foo: [{ bar: 1, baz: 2}] }
     */
    ObjectLikeSequence.prototype.merge = function merge(var_args) {
      var mergeFn = arguments.length > 1 && typeof arguments[arguments.length - 1] === "function" ?
        arrayPop.call(arguments) : null;
      return new MergedSequence(this, arraySlice.call(arguments, 0), mergeFn);
    };

    /**
     * @constructor
     */
    function MergedSequence(parent, others, mergeFn) {
      this.parent  = parent;
      this.others  = others;
      this.mergeFn = mergeFn;
    }

    MergedSequence.prototype = new ObjectLikeSequence();

    MergedSequence.prototype.each = function each(fn) {
      var others  = this.others,
          mergeFn = this.mergeFn || mergeObjects,
          keys    = {};

      var iteratedFullSource = this.parent.each(function(value, key) {
        var merged = value;

        forEach(others, function(other) {
          if (key in other) {
            merged = mergeFn(merged, other[key]);
          }
        });

        keys[key] = true;

        return fn(merged, key);
      });

      if (iteratedFullSource === false) {
        return false;
      }

      var remaining = {};

      forEach(others, function(other) {
        for (var k in other) {
          if (!keys[k]) {
            remaining[k] = mergeFn(remaining[k], other[k]);
          }
        }
      });

      return Lazy(remaining).each(fn);
    };

    /**
     * @private
     * @examples
     * mergeObjects({ foo: 1 }, { bar: 2 }); // => { foo: 1, bar: 2 }
     * mergeObjects({ foo: { bar: 1 } }, { foo: { baz: 2 } }); // => { foo: { bar: 1, baz: 2 } }
     * mergeObjects({ foo: { bar: 1 } }, { foo: undefined }); // => { foo: { bar: 1 } }
     * mergeObjects({ foo: { bar: 1 } }, { foo: null }); // => { foo: null }
     * mergeObjects({ array: [0, 1, 2] }, { array: [3, 4, 5] }).array; // instanceof Array
     * mergeObjects({ date: new Date() }, { date: new Date() }).date; // instanceof Date
     * mergeObjects([{ foo: 1 }], [{ bar: 2 }]); // => [{ foo: 1, bar: 2 }]
     */
    function mergeObjects(a, b) {
      var merged, prop;

      if (typeof b === 'undefined') {
        return a;
      }

      // Check that we're dealing with two objects or two arrays.
      if (isVanillaObject(a) && isVanillaObject(b)) {
        merged = {};
      } else if (a instanceof Array && b instanceof Array) {
        merged = [];
      } else {
        // Otherwise there's no merging to do -- just replace a w/ b.
        return b;
      }

      for (prop in a) {
        merged[prop] = mergeObjects(a[prop], b[prop]);
      }
      for (prop in b) {
        if (!merged[prop]) {
          merged[prop] = b[prop];
        }
      }
      return merged;
    }

    /**
     * Checks whether an object is a "vanilla" object, i.e. {'foo': 'bar'} as
     * opposed to an array, date, etc.
     *
     * @private
     * @examples
     * isVanillaObject({foo: 'bar'}); // => true
     * isVanillaObject(new Date());   // => false
     * isVanillaObject([1, 2, 3]);    // => false
     */
    function isVanillaObject(object) {
      return object && object.constructor === Object;
    }

    /**
     * Creates a {@link Sequence} consisting of the keys from this sequence whose
     *     values are functions.
     *
     * @public
     * @aka methods
     * @returns {Sequence} The new sequence.
     *
     * @examples
     * var dog = {
     *   name: "Fido",
     *   breed: "Golden Retriever",
     *   bark: function() { console.log("Woof!"); },
     *   wagTail: function() { console.log("TODO: implement robotic dog interface"); }
     * };
     *
     * Lazy(dog).functions() // sequence: ["bark", "wagTail"]
     */
    ObjectLikeSequence.prototype.functions = function functions() {
      return this
        .filter(function(v, k) { return typeof(v) === "function"; })
        .map(function(v, k) { return k; });
    };

    ObjectLikeSequence.prototype.methods = function methods() {
      return this.functions();
    };

    /**
     * Creates an {@link ObjectLikeSequence} consisting of the key/value pairs from
     * this sequence whose keys are included in the given array of property names.
     *
     * @public
     * @param {Array} properties An array of the properties to "pick" from this
     *     sequence.
     * @returns {ObjectLikeSequence} The new sequence.
     *
     * @examples
     * var players = {
     *   "who": "first",
     *   "what": "second",
     *   "i don't know": "third"
     * };
     *
     * Lazy(players).pick(["who", "what"]) // sequence: { who: "first", what: "second" }
     */
    ObjectLikeSequence.prototype.pick = function pick(properties) {
      return new PickSequence(this, properties);
    };

    /**
     * @constructor
     */
    function PickSequence(parent, properties) {
      this.parent     = parent;
      this.properties = properties;
    }

    PickSequence.prototype = new ObjectLikeSequence();

    PickSequence.prototype.get = function get(key) {
      return arrayContains(this.properties, key) ? this.parent.get(key) : undefined;
    };

    PickSequence.prototype.each = function each(fn) {
      var inArray    = arrayContains,
          properties = this.properties;

      return this.parent.each(function(value, key) {
        if (inArray(properties, key)) {
          return fn(value, key);
        }
      });
    };

    /**
     * Creates an {@link ObjectLikeSequence} consisting of the key/value pairs from
     * this sequence excluding those with the specified keys.
     *
     * @public
     * @param {Array} properties An array of the properties to *omit* from this
     *     sequence.
     * @returns {ObjectLikeSequence} The new sequence.
     *
     * @examples
     * var players = {
     *   "who": "first",
     *   "what": "second",
     *   "i don't know": "third"
     * };
     *
     * Lazy(players).omit(["who", "what"]) // sequence: { "i don't know": "third" }
     */
    ObjectLikeSequence.prototype.omit = function omit(properties) {
      return new OmitSequence(this, properties);
    };

    /**
     * @constructor
     */
    function OmitSequence(parent, properties) {
      this.parent     = parent;
      this.properties = properties;
    }

    OmitSequence.prototype = new ObjectLikeSequence();

    OmitSequence.prototype.get = function get(key) {
      return arrayContains(this.properties, key) ? undefined : this.parent.get(key);
    };

    OmitSequence.prototype.each = function each(fn) {
      var inArray    = arrayContains,
          properties = this.properties;

      return this.parent.each(function(value, key) {
        if (!inArray(properties, key)) {
          return fn(value, key);
        }
      });
    };

    /**
     * Maps the key/value pairs in this sequence to arrays.
     *
     * @public
     * @aka toArray
     * @returns {Sequence} An sequence of `[key, value]` pairs.
     *
     * @examples
     * var colorCodes = {
     *   red: "#f00",
     *   green: "#0f0",
     *   blue: "#00f"
     * };
     *
     * Lazy(colorCodes).pairs() // sequence: [["red", "#f00"], ["green", "#0f0"], ["blue", "#00f"]]
     */
    ObjectLikeSequence.prototype.pairs = function pairs() {
      return this.map(function(v, k) { return [k, v]; });
    };

    /**
     * Creates an array from the key/value pairs in this sequence.
     *
     * @public
     * @returns {Array} An array of `[key, value]` elements.
     *
     * @examples
     * var colorCodes = {
     *   red: "#f00",
     *   green: "#0f0",
     *   blue: "#00f"
     * };
     *
     * Lazy(colorCodes).toArray() // => [["red", "#f00"], ["green", "#0f0"], ["blue", "#00f"]]
     */
    ObjectLikeSequence.prototype.toArray = function toArray() {
      return this.pairs().toArray();
    };

    /**
     * Creates an object with the key/value pairs from this sequence.
     *
     * @public
     * @returns {Object} An object with the same key/value pairs as this sequence.
     *
     * @examples
     * var colorCodes = {
     *   red: "#f00",
     *   green: "#0f0",
     *   blue: "#00f"
     * };
     *
     * Lazy(colorCodes).toObject() // => { red: "#f00", green: "#0f0", blue: "#00f" }
     */
    ObjectLikeSequence.prototype.toObject = function toObject() {
      return this.reduce(function(object, value, key) {
        object[key] = value;
        return object;
      }, {});
    };

    // Now that we've fully initialized the ObjectLikeSequence prototype, we can
    // actually set the prototypes for GroupedSequence, IndexedSequence, and
    // CountedSequence.

    GroupedSequence.prototype = new ObjectLikeSequence();

    GroupedSequence.prototype.each = function each(fn) {
      var keyFn   = createCallback(this.keyFn),
          valFn   = createCallback(this.valFn),
          result;

      result = this.parent.reduce(function(grouped,e) {
        var key = keyFn(e),
            val = valFn(e);
        if (!(grouped[key] instanceof Array)) {
          grouped[key] = [val];
        } else {
          grouped[key].push(val);
        }
        return grouped;
      },{});

      return transform(function(grouped) {
        for (var key in grouped) {
          if (fn(grouped[key], key) === false) {
            return false;
          }
        }
      }, result);
    };

    IndexedSequence.prototype = new ObjectLikeSequence();

    IndexedSequence.prototype.each = function each(fn) {
      var keyFn   = createCallback(this.keyFn),
          valFn   = createCallback(this.valFn),
          indexed = {};

      return this.parent.each(function(e) {
        var key = keyFn(e),
            val = valFn(e);

        if (!indexed[key]) {
          indexed[key] = val;
          return fn(val, key);
        }
      });
    };

    CountedSequence.prototype = new ObjectLikeSequence();

    CountedSequence.prototype.each = function each(fn) {
      var keyFn   = createCallback(this.keyFn),
          counted = {};

      this.parent.each(function(e) {
        var key = keyFn(e);
        if (!counted[key]) {
          counted[key] = 1;
        } else {
          counted[key] += 1;
        }
      });

      for (var key in counted) {
        if (fn(counted[key], key) === false) {
          return false;
        }
      }

      return true;
    };

    /**
     * Watches for all changes to a specified property (or properties) of an
     * object and produces a sequence whose elements have the properties
     * `{ property, value }` indicating which property changed and what it was
     * changed to.
     *
     * Note that this method **only works on directly wrapped objects**; it will
     * *not* work on any arbitrary {@link ObjectLikeSequence}.
     *
     * @public
     * @param {(string|Array)=} propertyNames A property name or array of property
     *     names to watch. If this parameter is `undefined`, all of the object's
     *     current (enumerable) properties will be watched.
     * @returns {Sequence} A sequence comprising `{ property, value }` objects
     *     describing each change to the specified property/properties.
     *
     * @examples
     * var obj = {},
     *     changes = [];
     *
     * Lazy(obj).watch('foo').each(function(change) {
     *   changes.push(change);
     * });
     *
     * obj.foo = 1;
     * obj.bar = 2;
     * obj.foo = 3;
     *
     * obj.foo; // => 3
     * changes; // => [{ property: 'foo', value: 1 }, { property: 'foo', value: 3 }]
     */
    ObjectLikeSequence.prototype.watch = function watch(propertyNames) {
      throw new Error('You can only call #watch on a directly wrapped object.');
    };

    /**
     * @constructor
     */
    function ObjectWrapper(source) {
      this.source = source;
    }

    ObjectWrapper.prototype = new ObjectLikeSequence();

    ObjectWrapper.prototype.root = function root() {
      return this;
    };

    ObjectWrapper.prototype.isAsync = function isAsync() {
      return false;
    };

    ObjectWrapper.prototype.get = function get(key) {
      return this.source[key];
    };

    ObjectWrapper.prototype.each = function each(fn) {
      var source = this.source,
          key;

      for (key in source) {
        if (fn(source[key], key) === false) {
          return false;
        }
      }

      return true;
    };

    /**
     * A `StringLikeSequence` represents a sequence of characters.
     *
     * The initial sequence you get by wrapping a string with `Lazy(string)` is a
     * `StringLikeSequence`.
     *
     * All methods of `StringLikeSequence` that conceptually should return
     * something like a string return another `StringLikeSequence`.
     *
     * @public
     * @constructor
     *
     * @examples
     * function upcase(str) { return str.toUpperCase(); }
     *
     * Lazy('foo')               // instanceof Lazy.StringLikeSequence
     * Lazy('foo').toUpperCase() // instanceof Lazy.StringLikeSequence
     * Lazy('foo').reverse()     // instanceof Lazy.StringLikeSequence
     * Lazy('foo').take(2)       // instanceof Lazy.StringLikeSequence
     * Lazy('foo').drop(1)       // instanceof Lazy.StringLikeSequence
     * Lazy('foo').substring(1)  // instanceof Lazy.StringLikeSequence
     *
     * // Note that `map` does not create a `StringLikeSequence` because there's
     * // no guarantee the mapping function will return characters. In the event
     * // you do want to map a string onto a string-like sequence, use
     * // `mapString`:
     * Lazy('foo').map(Lazy.identity)       // instanceof Lazy.ArrayLikeSequence
     * Lazy('foo').mapString(Lazy.identity) // instanceof Lazy.StringLikeSequence
     */
    function StringLikeSequence() {}

    StringLikeSequence.prototype = new ArrayLikeSequence();

    /**
     * Create a new constructor function for a type inheriting from
     * `StringLikeSequence`.
     *
     * @public
     * @param {string|Array.<string>} methodName The name(s) of the method(s) to be
     *     used for constructing the new sequence. The method will be attached to
     *     the `StringLikeSequence` prototype so that it can be chained with any other
     *     methods that return string-like sequences.
     * @param {Object} overrides An object containing function overrides for this
     *     new sequence type. Has the same requirements as
     *     {@link ArrayLikeSequence.define}.
     * @returns {Function} A constructor for a new type inheriting from
     *     `StringLikeSequence`.
     *
     * @examples
     * Lazy.StringLikeSequence.define("zomg", {
     *   length: function() {
     *     return this.parent.length() + "!!ZOMG!!!1".length;
     *   },
     *
     *   get: function(i) {
     *     if (i < this.parent.length()) {
     *       return this.parent.get(i);
     *     }
     *     return "!!ZOMG!!!1".charAt(i - this.parent.length());
     *   }
     * });
     *
     * Lazy('foo').zomg() // sequence: "foo!!ZOMG!!!1"
     */
    StringLikeSequence.define = function define(methodName, overrides) {
      if (!overrides || typeof overrides.get !== 'function') {
        throw new Error("A custom string-like sequence must implement *at least* get!");
      }

      return defineSequenceType(StringLikeSequence, methodName, overrides);
    };

    StringLikeSequence.prototype.value = function value() {
      return this.toString();
    };

    /**
     * Returns an {@link IndexedIterator} that will step over each character in this
     * sequence one by one.
     *
     * @returns {IndexedIterator} The iterator.
     */
    StringLikeSequence.prototype.getIterator = function getIterator() {
      return new CharIterator(this);
    };

    /**
     * @constructor
     */
    function CharIterator(source) {
      this.source = Lazy(source);
      this.index = -1;
    }

    CharIterator.prototype.current = function current() {
      return this.source.charAt(this.index);
    };

    CharIterator.prototype.moveNext = function moveNext() {
      return (++this.index < this.source.length());
    };

    /**
     * Returns the character at the given index of this sequence, or the empty
     * string if the specified index lies outside the bounds of the sequence.
     *
     * @public
     * @param {number} i The index of this sequence.
     * @returns {string} The character at the specified index.
     *
     * @examples
     * Lazy("foo").charAt(0)  // => "f"
     * Lazy("foo").charAt(-1) // => ""
     * Lazy("foo").charAt(10) // => ""
     */
    StringLikeSequence.prototype.charAt = function charAt(i) {
      return this.get(i);
    };

    /**
     * Returns the character code at the given index of this sequence, or `NaN` if
     * the index lies outside the bounds of the sequence.
     *
     * @public
     * @param {number} i The index of the character whose character code you want.
     * @returns {number} The character code.
     *
     * @examples
     * Lazy("abc").charCodeAt(0)  // => 97
     * Lazy("abc").charCodeAt(-1) // => NaN
     * Lazy("abc").charCodeAt(10) // => NaN
     */
    StringLikeSequence.prototype.charCodeAt = function charCodeAt(i) {
      var char = this.charAt(i);
      if (!char) { return NaN; }

      return char.charCodeAt(0);
    };

    /**
     * Returns a {@link StringLikeSequence} comprising the characters from *this*
     * sequence starting at `start` and ending at `stop` (exclusive), or---if
     * `stop` is `undefined`, including the rest of the sequence.
     *
     * @public
     * @param {number} start The index where this sequence should begin.
     * @param {number=} stop The index (exclusive) where this sequence should end.
     * @returns {StringLikeSequence} The new sequence.
     *
     * @examples
     * Lazy("foo").substring(1)      // sequence: "oo"
     * Lazy("foo").substring(-1)     // sequence: "foo"
     * Lazy("hello").substring(1, 3) // sequence: "el"
     * Lazy("hello").substring(1, 9) // sequence: "ello"
     */
    StringLikeSequence.prototype.substring = function substring(start, stop) {
      return new StringSegment(this, start, stop);
    };

    /**
     * @constructor
     */
    function StringSegment(parent, start, stop) {
      this.parent = parent;
      this.start  = Math.max(0, start);
      this.stop   = stop;
    }

    StringSegment.prototype = new StringLikeSequence();

    StringSegment.prototype.get = function get(i) {
      return this.parent.get(i + this.start);
    };

    StringSegment.prototype.length = function length() {
      return (typeof this.stop === "number" ? this.stop : this.parent.length()) - this.start;
    };

    /**
     * An optimized version of {@link Sequence#first} that returns another
     * {@link StringLikeSequence} (or just the first character, if `count` is
     * undefined).
     *
     * @public
     * @examples
     * Lazy('foo').first()                // => 'f'
     * Lazy('fo').first(2)                // sequence: 'fo'
     * Lazy('foo').first(10)              // sequence: 'foo'
     * Lazy('foo').toUpperCase().first()  // => 'F'
     * Lazy('foo').toUpperCase().first(2) // sequence: 'FO'
     */
    StringLikeSequence.prototype.first = function first(count) {
      if (typeof count === "undefined") {
        return this.charAt(0);
      }

      return this.substring(0, count);
    };

    /**
     * An optimized version of {@link Sequence#last} that returns another
     * {@link StringLikeSequence} (or just the last character, if `count` is
     * undefined).
     *
     * @public
     * @examples
     * Lazy('foo').last()                // => 'o'
     * Lazy('foo').last(2)               // sequence: 'oo'
     * Lazy('foo').last(10)              // sequence: 'foo'
     * Lazy('foo').toUpperCase().last()  // => 'O'
     * Lazy('foo').toUpperCase().last(2) // sequence: 'OO'
     */
    StringLikeSequence.prototype.last = function last(count) {
      if (typeof count === "undefined") {
        return this.charAt(this.length() - 1);
      }

      return this.substring(this.length() - count);
    };

    StringLikeSequence.prototype.drop = function drop(count) {
      return this.substring(count);
    };

    /**
     * Finds the index of the first occurrence of the given substring within this
     * sequence, starting from the specified index (or the beginning of the
     * sequence).
     *
     * @public
     * @param {string} substring The substring to search for.
     * @param {number=} startIndex The index from which to start the search.
     * @returns {number} The first index where the given substring is found, or
     *     -1 if it isn't in the sequence.
     *
     * @examples
     * Lazy('canal').indexOf('a')    // => 1
     * Lazy('canal').indexOf('a', 2) // => 3
     * Lazy('canal').indexOf('ana')  // => 1
     * Lazy('canal').indexOf('andy') // => -1
     * Lazy('canal').indexOf('x')    // => -1
     */
    StringLikeSequence.prototype.indexOf = function indexOf(substring, startIndex) {
      return this.toString().indexOf(substring, startIndex);
    };

    /**
     * Finds the index of the last occurrence of the given substring within this
     * sequence, starting from the specified index (or the end of the sequence)
     * and working backwards.
     *
     * @public
     * @param {string} substring The substring to search for.
     * @param {number=} startIndex The index from which to start the search.
     * @returns {number} The last index where the given substring is found, or
     *     -1 if it isn't in the sequence.
     *
     * @examples
     * Lazy('canal').lastIndexOf('a')    // => 3
     * Lazy('canal').lastIndexOf('a', 2) // => 1
     * Lazy('canal').lastIndexOf('ana')  // => 1
     * Lazy('canal').lastIndexOf('andy') // => -1
     * Lazy('canal').lastIndexOf('x')    // => -1
     */
    StringLikeSequence.prototype.lastIndexOf = function lastIndexOf(substring, startIndex) {
      return this.toString().lastIndexOf(substring, startIndex);
    };

    /**
     * Checks if this sequence contains a given substring.
     *
     * @public
     * @param {string} substring The substring to check for.
     * @returns {boolean} Whether or not this sequence contains `substring`.
     *
     * @examples
     * Lazy('hello').contains('ell') // => true
     * Lazy('hello').contains('')    // => true
     * Lazy('hello').contains('abc') // => false
     */
    StringLikeSequence.prototype.contains = function contains(substring) {
      return this.indexOf(substring) !== -1;
    };

    /**
     * Checks if this sequence ends with a given suffix.
     *
     * @public
     * @param {string} suffix The suffix to check for.
     * @returns {boolean} Whether or not this sequence ends with `suffix`.
     *
     * @examples
     * Lazy('foo').endsWith('oo')  // => true
     * Lazy('foo').endsWith('')    // => true
     * Lazy('foo').endsWith('abc') // => false
     */
    StringLikeSequence.prototype.endsWith = function endsWith(suffix) {
      return this.substring(this.length() - suffix.length).toString() === suffix;
    };

    /**
     * Checks if this sequence starts with a given prefix.
     *
     * @public
     * @param {string} prefix The prefix to check for.
     * @returns {boolean} Whether or not this sequence starts with `prefix`.
     *
     * @examples
     * Lazy('foo').startsWith('fo')  // => true
     * Lazy('foo').startsWith('')    // => true
     * Lazy('foo').startsWith('abc') // => false
     */
    StringLikeSequence.prototype.startsWith = function startsWith(prefix) {
      return this.substring(0, prefix.length).toString() === prefix;
    };

    /**
     * Converts all of the characters in this string to uppercase.
     *
     * @public
     * @returns {StringLikeSequence} A new sequence with the same characters as
     *     this sequence, all uppercase.
     *
     * @examples
     * function nextLetter(a) {
     *   return String.fromCharCode(a.charCodeAt(0) + 1);
     * }
     *
     * Lazy('foo').toUpperCase()                       // sequence: 'FOO'
     * Lazy('foo').substring(1).toUpperCase()          // sequence: 'OO'
     * Lazy('abc').mapString(nextLetter).toUpperCase() // sequence: 'BCD'
     */
    StringLikeSequence.prototype.toUpperCase = function toUpperCase() {
      return this.mapString(function(char) { return char.toUpperCase(); });
    };

    /**
     * Converts all of the characters in this string to lowercase.
     *
     * @public
     * @returns {StringLikeSequence} A new sequence with the same characters as
     *     this sequence, all lowercase.
     *
     * @examples
     * function nextLetter(a) {
     *   return String.fromCharCode(a.charCodeAt(0) + 1);
     * }
     *
     * Lazy('FOO').toLowerCase()                       // sequence: 'foo'
     * Lazy('FOO').substring(1).toLowerCase()          // sequence: 'oo'
     * Lazy('ABC').mapString(nextLetter).toLowerCase() // sequence: 'bcd'
     */
    StringLikeSequence.prototype.toLowerCase = function toLowerCase() {
      return this.mapString(function(char) { return char.toLowerCase(); });
    };

    /**
     * Maps the characters of this sequence onto a new {@link StringLikeSequence}.
     *
     * @public
     * @param {Function} mapFn The function used to map characters from this
     *     sequence onto the new sequence.
     * @returns {StringLikeSequence} The new sequence.
     *
     * @examples
     * function upcase(char) { return char.toUpperCase(); }
     *
     * Lazy("foo").mapString(upcase)               // sequence: "FOO"
     * Lazy("foo").mapString(upcase).charAt(0)     // => "F"
     * Lazy("foo").mapString(upcase).charCodeAt(0) // => 70
     * Lazy("foo").mapString(upcase).substring(1)  // sequence: "OO"
     */
    StringLikeSequence.prototype.mapString = function mapString(mapFn) {
      return new MappedStringLikeSequence(this, mapFn);
    };

    /**
     * @constructor
     */
    function MappedStringLikeSequence(parent, mapFn) {
      this.parent = parent;
      this.mapFn  = mapFn;
    }

    MappedStringLikeSequence.prototype = new StringLikeSequence();
    MappedStringLikeSequence.prototype.get = IndexedMappedSequence.prototype.get;
    MappedStringLikeSequence.prototype.length = IndexedMappedSequence.prototype.length;

    /**
     * Returns a copy of this sequence that reads back to front.
     *
     * @public
     *
     * @examples
     * Lazy("abcdefg").reverse() // sequence: "gfedcba"
     */
    StringLikeSequence.prototype.reverse = function reverse() {
      return new ReversedStringLikeSequence(this);
    };

    /**
     * @constructor
     */
    function ReversedStringLikeSequence(parent) {
      this.parent = parent;
    }

    ReversedStringLikeSequence.prototype = new StringLikeSequence();
    ReversedStringLikeSequence.prototype.get = IndexedReversedSequence.prototype.get;
    ReversedStringLikeSequence.prototype.length = IndexedReversedSequence.prototype.length;

    StringLikeSequence.prototype.toString = function toString() {
      return this.join("");
    };

    /**
     * Creates a {@link Sequence} comprising all of the matches for the specified
     * pattern in the underlying string.
     *
     * @public
     * @param {RegExp} pattern The pattern to match.
     * @returns {Sequence} A sequence of all the matches.
     *
     * @examples
     * Lazy("abracadabra").match(/a[bcd]/) // sequence: ["ab", "ac", "ad", "ab"]
     * Lazy("fee fi fo fum").match(/\w+/)  // sequence: ["fee", "fi", "fo", "fum"]
     * Lazy("hello").match(/xyz/)          // sequence: []
     */
    StringLikeSequence.prototype.match = function match(pattern) {
      return new StringMatchSequence(this, pattern);
    };

    /**
     * @constructor
     */
    function StringMatchSequence(parent, pattern) {
      this.parent = parent;
      this.pattern = pattern;
    }

    StringMatchSequence.prototype = new Sequence();

    StringMatchSequence.prototype.getIterator = function getIterator() {
      return new StringMatchIterator(this.parent.toString(), this.pattern);
    };

    /**
     * @constructor
     */
    function StringMatchIterator(source, pattern) {
      this.source  = source;
      this.pattern = cloneRegex(pattern);
    }

    StringMatchIterator.prototype.current = function current() {
      return this.match[0];
    };

    StringMatchIterator.prototype.moveNext = function moveNext() {
      return !!(this.match = this.pattern.exec(this.source));
    };

    /**
     * Creates a {@link Sequence} comprising all of the substrings of this string
     * separated by the given delimiter, which can be either a string or a regular
     * expression.
     *
     * @public
     * @param {string|RegExp} delimiter The delimiter to use for recognizing
     *     substrings.
     * @returns {Sequence} A sequence of all the substrings separated by the given
     *     delimiter.
     *
     * @examples
     * Lazy("foo").split("")                      // sequence: ["f", "o", "o"]
     * Lazy("yo dawg").split(" ")                 // sequence: ["yo", "dawg"]
     * Lazy("bah bah\tblack  sheep").split(/\s+/) // sequence: ["bah", "bah", "black", "sheep"]
     */
    StringLikeSequence.prototype.split = function split(delimiter) {
      return new SplitStringSequence(this, delimiter);
    };

    /**
     * @constructor
     */
    function SplitStringSequence(parent, pattern) {
      this.parent = parent;
      this.pattern = pattern;
    }

    SplitStringSequence.prototype = new Sequence();

    SplitStringSequence.prototype.getIterator = function getIterator() {
      var source = this.parent.toString();

      if (this.pattern instanceof RegExp) {
        if (this.pattern.source === "" || this.pattern.source === "(?:)") {
          return new CharIterator(source);
        } else {
          return new SplitWithRegExpIterator(source, this.pattern);
        }
      } else if (this.pattern === "") {
        return new CharIterator(source);
      } else {
        return new SplitWithStringIterator(source, this.pattern);
      }
    };

    /**
     * @constructor
     */
    function SplitWithRegExpIterator(source, pattern) {
      this.source  = source;
      this.pattern = cloneRegex(pattern);
    }

    SplitWithRegExpIterator.prototype.current = function current() {
      return this.source.substring(this.start, this.end);
    };

    SplitWithRegExpIterator.prototype.moveNext = function moveNext() {
      if (!this.pattern) {
        return false;
      }

      var match = this.pattern.exec(this.source);

      if (match) {
        this.start = this.nextStart ? this.nextStart : 0;
        this.end = match.index;
        this.nextStart = match.index + match[0].length;
        return true;

      } else if (this.pattern) {
        this.start = this.nextStart;
        this.end = undefined;
        this.nextStart = undefined;
        this.pattern = undefined;
        return true;
      }

      return false;
    };

    /**
     * @constructor
     */
    function SplitWithStringIterator(source, delimiter) {
      this.source = source;
      this.delimiter = delimiter;
    }

    SplitWithStringIterator.prototype.current = function current() {
      return this.source.substring(this.leftIndex, this.rightIndex);
    };

    SplitWithStringIterator.prototype.moveNext = function moveNext() {
      if (!this.finished) {
        this.leftIndex = typeof this.leftIndex !== "undefined" ?
          this.rightIndex + this.delimiter.length :
          0;
        this.rightIndex = this.source.indexOf(this.delimiter, this.leftIndex);
      }

      if (this.rightIndex === -1) {
        this.finished = true;
        this.rightIndex = undefined;
        return true;
      }

      return !this.finished;
    };

    /**
     * Wraps a string exposing {@link #match} and {@link #split} methods that return
     * {@link Sequence} objects instead of arrays, improving on the efficiency of
     * JavaScript's built-in `String#split` and `String.match` methods and
     * supporting asynchronous iteration.
     *
     * @param {string} source The string to wrap.
     * @constructor
     */
    function StringWrapper(source) {
      this.source = source;
    }

    StringWrapper.prototype = new StringLikeSequence();

    StringWrapper.prototype.root = function root() {
      return this;
    };

    StringWrapper.prototype.isAsync = function isAsync() {
      return false;
    };

    StringWrapper.prototype.get = function get(i) {
      return this.source.charAt(i);
    };

    StringWrapper.prototype.length = function length() {
      return this.source.length;
    };

    StringWrapper.prototype.toString = function toString() {
      return this.source;
    };

    /**
     * A `GeneratedSequence` does not wrap an in-memory colllection but rather
     * determines its elements on-the-fly during iteration according to a generator
     * function.
     *
     * You create a `GeneratedSequence` by calling {@link Lazy.generate}.
     *
     * @public
     * @constructor
     * @param {function(number):*} generatorFn A function which accepts an index
     *     and returns a value for the element at that position in the sequence.
     * @param {number=} length The length of the sequence. If this argument is
     *     omitted, the sequence will go on forever.
     */
    function GeneratedSequence(generatorFn, length) {
      this.get = generatorFn;
      this.fixedLength = length;
    }

    GeneratedSequence.prototype = new Sequence();

    GeneratedSequence.prototype.isAsync = function isAsync() {
      return false;
    };

    /**
     * Returns the length of this sequence.
     *
     * @public
     * @returns {number} The length, or `undefined` if this is an indefinite
     *     sequence.
     */
    GeneratedSequence.prototype.length = function length() {
      return this.fixedLength;
    };

    /**
     * Iterates over the sequence produced by invoking this sequence's generator
     * function up to its specified length, or, if length is `undefined`,
     * indefinitely (in which case the sequence will go on forever--you would need
     * to call, e.g., {@link Sequence#take} to limit iteration).
     *
     * @public
     * @param {Function} fn The function to call on each output from the generator
     *     function.
     */
    GeneratedSequence.prototype.each = function each(fn) {
      var generatorFn = this.get,
          length = this.fixedLength,
          i = 0;

      while (typeof length === "undefined" || i < length) {
        if (fn(generatorFn(i), i++) === false) {
          return false;
        }
      }

      return true;
    };

    GeneratedSequence.prototype.getIterator = function getIterator() {
      return new GeneratedIterator(this);
    };

    /**
     * Iterates over a generated sequence. (This allows generated sequences to be
     * iterated asynchronously.)
     *
     * @param {GeneratedSequence} sequence The generated sequence to iterate over.
     * @constructor
     */
    function GeneratedIterator(sequence) {
      this.sequence     = sequence;
      this.index        = 0;
      this.currentValue = null;
    }

    GeneratedIterator.prototype.current = function current() {
      return this.currentValue;
    };

    GeneratedIterator.prototype.moveNext = function moveNext() {
      var sequence = this.sequence;

      if (typeof sequence.fixedLength === "number" && this.index >= sequence.fixedLength) {
        return false;
      }

      this.currentValue = sequence.get(this.index++);
      return true;
    };

    /**
     * An `AsyncSequence` iterates over its elements asynchronously when
     * {@link #each} is called.
     *
     * You get an `AsyncSequence` by calling {@link Sequence#async} on any
     * sequence. Note that some sequence types may not support asynchronous
     * iteration.
     *
     * Returning values
     * ----------------
     *
     * Because of its asynchronous nature, an `AsyncSequence` cannot be used in the
     * same way as other sequences for functions that return values directly (e.g.,
     * `reduce`, `max`, `any`, even `toArray`).
     *
     * Instead, these methods return an `AsyncHandle` whose `onComplete` method
     * accepts a callback that will be called with the final result once iteration
     * has finished.
     *
     * Defining custom asynchronous sequences
     * --------------------------------------
     *
     * There are plenty of ways to define an asynchronous sequence. Here's one.
     *
     * 1. First, implement an {@link Iterator}. This is an object whose prototype
     *    has the methods {@link Iterator#moveNext} (which returns a `boolean`) and
     *    {@link current} (which returns the current value).
     * 2. Next, create a simple wrapper that inherits from `AsyncSequence`, whose
     *    `getIterator` function returns an instance of the iterator type you just
     *    defined.
     *
     * The default implementation for {@link #each} on an `AsyncSequence` is to
     * create an iterator and then asynchronously call {@link Iterator#moveNext}
     * (using `setImmediate`, if available, otherwise `setTimeout`) until the iterator
     * can't move ahead any more.
     *
     * @public
     * @constructor
     * @param {Sequence} parent A {@link Sequence} to wrap, to expose asynchronous
     *     iteration.
     * @param {number=} interval How many milliseconds should elapse between each
     *     element when iterating over this sequence. If this argument is omitted,
     *     asynchronous iteration will be executed as fast as possible.
     */
    function AsyncSequence(parent, interval) {
      if (parent instanceof AsyncSequence) {
        throw new Error("Sequence is already asynchronous!");
      }

      this.parent         = parent;
      this.interval       = interval;
      this.onNextCallback = getOnNextCallback(interval);
      this.cancelCallback = getCancelCallback(interval);
    }

    AsyncSequence.prototype = new Sequence();

    AsyncSequence.prototype.isAsync = function isAsync() {
      return true;
    };

    /**
     * Throws an exception. You cannot manually iterate over an asynchronous
     * sequence.
     *
     * @public
     * @example
     * Lazy([1, 2, 3]).async().getIterator() // throws
     */
    AsyncSequence.prototype.getIterator = function getIterator() {
      throw new Error('An AsyncSequence does not support synchronous iteration.');
    };

    /**
     * An asynchronous version of {@link Sequence#each}.
     *
     * @public
     * @param {Function} fn The function to invoke asynchronously on each element in
     *     the sequence one by one.
     * @returns {AsyncHandle} An {@link AsyncHandle} providing the ability to
     *     cancel the asynchronous iteration (by calling `cancel()`) as well as
     *     supply callback(s) for when an error is encountered (`onError`) or when
     *     iteration is complete (`onComplete`).
     */
    AsyncSequence.prototype.each = function each(fn) {
      var iterator = this.parent.getIterator(),
          onNextCallback = this.onNextCallback,
          cancelCallback = this.cancelCallback,
          i = 0;

      var handle = new AsyncHandle(function cancel() {
        if (cancellationId) {
          cancelCallback(cancellationId);
        }
      });

      var cancellationId = onNextCallback(function iterate() {
        cancellationId = null;

        try {
          if (iterator.moveNext() && fn(iterator.current(), i++) !== false) {
            cancellationId = onNextCallback(iterate);

          } else {
            handle._resolve();
          }

        } catch (e) {
          handle._reject(e);
        }
      });

      return handle;
    };

    /**
     * An `AsyncHandle` provides a [Promises/A+](http://promises-aplus.github.io/promises-spec/)
     * compliant interface for an {@link AsyncSequence} that is currently (or was)
     * iterating over its elements.
     *
     * In addition to behaving as a promise, an `AsyncHandle` provides the ability
     * to {@link AsyncHandle#cancel} iteration (if `cancelFn` is provided)
     * and also offers convenient {@link AsyncHandle#onComplete} and
     * {@link AsyncHandle#onError} methods to attach listeners for when iteration
     * is complete or an error is thrown during iteration.
     *
     * @public
     * @param {Function} cancelFn A function to cancel asynchronous iteration.
     *     This is passed in to support different cancellation mechanisms for
     *     different forms of asynchronous sequences (e.g., timeout-based
     *     sequences, sequences based on I/O, etc.).
     * @constructor
     *
     * @example
     * // Create a sequence of 100,000 random numbers, in chunks of 100.
     * var sequence = Lazy.generate(Math.random)
     *   .chunk(100)
     *   .async()
     *   .take(1000);
     *
     * // Reduce-style operations -- i.e., operations that return a *value* (as
     * // opposed to a *sequence*) -- return an AsyncHandle for async sequences.
     * var handle = sequence.toArray();
     *
     * handle.onComplete(function(array) {
     *   // Do something w/ 1,000-element array.
     * });
     *
     * // Since an AsyncHandle is a promise, you can also use it to create
     * // subsequent promises using `then` (see the Promises/A+ spec for more
     * // info).
     * var flattened = handle.then(function(array) {
     *   return Lazy(array).flatten();
     * });
     */
    function AsyncHandle(cancelFn) {
      this.resolveListeners = [];
      this.rejectListeners = [];
      this.state = PENDING;
      this.cancelFn = cancelFn;
    }

    // Async handle states
    var PENDING  = 1,
        RESOLVED = 2,
        REJECTED = 3;

    AsyncHandle.prototype.then = function then(onFulfilled, onRejected) {
      var promise = new AsyncHandle(this.cancelFn);

      this.resolveListeners.push(function(value) {
        try {
          if (typeof onFulfilled !== 'function') {
            resolve(promise, value);
            return;
          }

          resolve(promise, onFulfilled(value));

        } catch (e) {
          promise._reject(e);
        }
      });

      this.rejectListeners.push(function(reason) {
        try {
          if (typeof onRejected !== 'function') {
            promise._reject(reason);
            return;
          }

          resolve(promise, onRejected(reason));

        } catch (e) {
          promise._reject(e);
        }
      });

      if (this.state === RESOLVED) {
        this._resolve(this.value);
      }

      if (this.state === REJECTED) {
        this._reject(this.reason);
      }

      return promise;
    };

    AsyncHandle.prototype._resolve = function _resolve(value) {
      if (this.state === REJECTED) {
        return;
      }

      if (this.state === PENDING) {
        this.state = RESOLVED;
        this.value = value;
      }

      consumeListeners(this.resolveListeners, this.value);
    };

    AsyncHandle.prototype._reject = function _reject(reason) {
      if (this.state === RESOLVED) {
        return;
      }

      if (this.state === PENDING) {
        this.state = REJECTED;
        this.reason = reason;
      }

      consumeListeners(this.rejectListeners, this.reason);
    };

    /**
     * Cancels asynchronous iteration.
     *
     * @public
     */
    AsyncHandle.prototype.cancel = function cancel() {
      if (this.cancelFn) {
        this.cancelFn();
        this.cancelFn = null;
        this._resolve(false);
      }
    };

    /**
     * Updates the handle with a callback to execute when iteration is completed.
     *
     * @public
     * @param {Function} callback The function to call when the asynchronous
     *     iteration is completed.
     * @return {AsyncHandle} A reference to the handle (for chaining).
     */
    AsyncHandle.prototype.onComplete = function onComplete(callback) {
      this.resolveListeners.push(callback);
      return this;
    };

    /**
     * Updates the handle with a callback to execute if/when any error is
     * encountered during asynchronous iteration.
     *
     * @public
     * @param {Function} callback The function to call, with any associated error
     *     object, when an error occurs.
     * @return {AsyncHandle} A reference to the handle (for chaining).
     */
    AsyncHandle.prototype.onError = function onError(callback) {
      this.rejectListeners.push(callback);
      return this;
    };

    /**
     * Promise resolution procedure:
     * http://promises-aplus.github.io/promises-spec/#the_promise_resolution_procedure
     */
    function resolve(promise, x) {
      if (promise === x) {
        promise._reject(new TypeError('Cannot resolve a promise to itself'));
        return;
      }

      if (x instanceof AsyncHandle) {
        x.then(
          function(value) { resolve(promise, value); },
          function(reason) { promise._reject(reason); }
        );
        return;
      }

      var then;
      try {
        then = (/function|object/).test(typeof x) && x != null && x.then;
      } catch (e) {
        promise._reject(e);
        return;
      }

      var thenableState = PENDING;
      if (typeof then === 'function') {
        try {
          then.call(
            x,
            function resolvePromise(value) {
              if (thenableState !== PENDING) {
                return;
              }
              thenableState = RESOLVED;
              resolve(promise, value);
            },
            function rejectPromise(reason) {
              if (thenableState !== PENDING) {
                return;
              }
              thenableState = REJECTED;
              promise._reject(reason);
            }
          );
        } catch (e) {
          if (thenableState !== PENDING) {
            return;
          }

          promise._reject(e);
        }

        return;
      }

      promise._resolve(x);
    }

    function consumeListeners(listeners, value, callback) {
      callback || (callback = getOnNextCallback());

      callback(function() {
        if (listeners.length > 0) {
          listeners.shift()(value);
          consumeListeners(listeners, value, callback);
        }
      });
    }

    function getOnNextCallback(interval) {
      if (typeof interval === "undefined") {
        if (typeof setImmediate === "function") {
          return setImmediate;
        }
      }

      interval = interval || 0;
      return function(fn) {
        return setTimeout(fn, interval);
      };
    }

    function getCancelCallback(interval) {
      if (typeof interval === "undefined") {
        if (typeof clearImmediate === "function") {
          return clearImmediate;
        }
      }

      return clearTimeout;
    }

    /**
     * Transform a value, whether the value is retrieved asynchronously or directly.
     *
     * @private
     * @param {Function} fn The function that transforms the value.
     * @param {*} value The value to be transformed. This can be an {@link AsyncHandle} when the value
     *     is retrieved asynchronously, otherwise it can be anything.
     * @returns {*} An {@link AsyncHandle} when `value` is also an {@link AsyncHandle}, otherwise
     *     whatever `fn` resulted in.
     */
    function transform(fn, value) {
      if (value instanceof AsyncHandle) {
        return value.then(function() { fn(value); });
      }
      return fn(value);
    }

    /**
     * An async version of {@link Sequence#reverse}.
     */
    AsyncSequence.prototype.reverse = function reverse() {
      return this.parent.reverse().async();
    };

    /**
     * A version of {@link Sequence#find} which returns an {@link AsyncHandle}.
     *
     * @public
     * @param {Function} predicate A function to call on (potentially) every element
     *     in the sequence.
     * @returns {AsyncHandle} An {@link AsyncHandle} (promise) which resolves to
     *     the found element, once it is detected, or else `undefined`.
     */
    AsyncSequence.prototype.find = function find(predicate) {
      var found;

      var handle = this.each(function(e, i) {
        if (predicate(e, i)) {
          found = e;
          return false;
        }
      });

      return handle.then(function() { return found; });
    };

    /**
     * A version of {@link Sequence#indexOf} which returns an {@link AsyncHandle}.
     *
     * @public
     * @param {*} value The element to search for in the sequence.
     * @returns {AsyncHandle} An {@link AsyncHandle} (promise) which resolves to
     *     the found index, once it is detected, or -1.
     */
    AsyncSequence.prototype.indexOf = function indexOf(value) {
      var foundIndex = -1;

      var handle = this.each(function(e, i) {
        if (e === value) {
          foundIndex = i;
          return false;
        }
      });

      return handle.then(function() {
        return foundIndex;
      });
    };

    /**
     * A version of {@link Sequence#contains} which returns an {@link AsyncHandle}.
     *
     * @public
     * @param {*} value The element to search for in the sequence.
     * @returns {AsyncHandle} An {@link AsyncHandle} (promise) which resolves to
     *     either `true` or `false` to indicate whether the element was found.
     */
    AsyncSequence.prototype.contains = function contains(value) {
      var found = false;

      var handle = this.each(function(e) {
        if (e === value) {
          found = true;
          return false;
        }
      });

      return handle.then(function() {
        return found;
      });
    };

    /**
     * Just return the same sequence for `AsyncSequence#async` (I see no harm in this).
     */
    AsyncSequence.prototype.async = function async() {
      return this;
    };

    /**
     * See {@link ObjectLikeSequence#watch} for docs.
     */
    ObjectWrapper.prototype.watch = function watch(propertyNames) {
      return new WatchedPropertySequence(this.source, propertyNames);
    };

    function WatchedPropertySequence(object, propertyNames) {
      this.listeners = [];

      if (!propertyNames) {
        propertyNames = Lazy(object).keys().toArray();
      } else if (!(propertyNames instanceof Array)) {
        propertyNames = [propertyNames];
      }

      var listeners = this.listeners,
          index     = 0;

      Lazy(propertyNames).each(function(propertyName) {
        var propertyValue = object[propertyName];

        Object.defineProperty(object, propertyName, {
          get: function() {
            return propertyValue;
          },

          set: function(value) {
            for (var i = listeners.length - 1; i >= 0; --i) {
              if (listeners[i]({ property: propertyName, value: value }, index) === false) {
                listeners.splice(i, 1);
              }
            }
            propertyValue = value;
            ++index;
          }
        });
      });
    }

    WatchedPropertySequence.prototype = new AsyncSequence();

    WatchedPropertySequence.prototype.each = function each(fn) {
      this.listeners.push(fn);
    };

    /**
     * A StreamLikeSequence comprises a sequence of 'chunks' of data, which are
     * typically multiline strings.
     *
     * @constructor
     */
    function StreamLikeSequence() {}

    StreamLikeSequence.prototype = new AsyncSequence();

    StreamLikeSequence.prototype.isAsync = function isAsync() {
      return true;
    };

    StreamLikeSequence.prototype.split = function split(delimiter) {
      return new SplitStreamSequence(this, delimiter);
    };

    /**
     * @constructor
     */
    function SplitStreamSequence(parent, delimiter) {
      this.parent    = parent;
      this.delimiter = delimiter;
      this.each      = this.getEachForDelimiter(delimiter);
    }

    SplitStreamSequence.prototype = new Sequence();

    SplitStreamSequence.prototype.getEachForDelimiter = function getEachForDelimiter(delimiter) {
      if (delimiter instanceof RegExp) {
        return this.regexEach;
      }

      return this.stringEach;
    };

    SplitStreamSequence.prototype.regexEach = function each(fn) {
      var delimiter = cloneRegex(this.delimiter),
          buffer = '',
          start = 0, end,
          index = 0;

      var handle = this.parent.each(function(chunk) {
        buffer += chunk;

        var match;
        while (match = delimiter.exec(buffer)) {
          end = match.index;
          if (fn(buffer.substring(start, end), index++) === false) {
            return false;
          }
          start = end + match[0].length;
        }

        buffer = buffer.substring(start);
        start = 0;
      });

      handle.onComplete(function() {
        if (buffer.length > 0) {
          fn(buffer, index++);
        }
      });

      return handle;
    };

    SplitStreamSequence.prototype.stringEach = function each(fn) {
      var delimiter  = this.delimiter,
          pieceIndex = 0,
          buffer = '',
          bufferIndex = 0;

      var handle = this.parent.each(function(chunk) {
        buffer += chunk;
        var delimiterIndex;
        while ((delimiterIndex = buffer.indexOf(delimiter)) >= 0) {
          var piece = buffer.substr(0,delimiterIndex);
          buffer = buffer.substr(delimiterIndex+delimiter.length);
          if (fn(piece,pieceIndex++) === false) {
            return false;
          }
        }
        return true;
      });

      handle.onComplete(function() {
        fn(buffer, pieceIndex++);
      });

      return handle;
    };

    StreamLikeSequence.prototype.lines = function lines() {
      return this.split("\n");
    };

    StreamLikeSequence.prototype.match = function match(pattern) {
      return new MatchedStreamSequence(this, pattern);
    };

    /**
     * @constructor
     */
    function MatchedStreamSequence(parent, pattern) {
      this.parent  = parent;
      this.pattern = cloneRegex(pattern);
    }

    MatchedStreamSequence.prototype = new AsyncSequence();

    MatchedStreamSequence.prototype.each = function each(fn) {
      var pattern = this.pattern,
          done      = false,
          i         = 0;

      return this.parent.each(function(chunk) {
        Lazy(chunk).match(pattern).each(function(match) {
          if (fn(match, i++) === false) {
            done = true;
            return false;
          }
        });

        return !done;
      });
    };

    /**
     * Defines a wrapper for custom {@link StreamLikeSequence}s. This is useful
     * if you want a way to handle a stream of events as a sequence, but you can't
     * use Lazy's existing interface (i.e., you're wrapping an object from a
     * library with its own custom events).
     *
     * This method defines a *factory*: that is, it produces a function that can
     * be used to wrap objects and return a {@link Sequence}. Hopefully the
     * example will make this clear.
     *
     * @public
     * @param {Function} initializer An initialization function called on objects
     *     created by this factory. `this` will be bound to the created object,
     *     which is an instance of {@link StreamLikeSequence}. Use `emit` to
     *     generate data for the sequence.
     * @returns {Function} A function that creates a new {@link StreamLikeSequence},
     *     initializes it using the specified function, and returns it.
     *
     * @example
     * var factory = Lazy.createWrapper(function(eventSource) {
     *   var sequence = this;
     *
     *   eventSource.handleEvent(function(data) {
     *     sequence.emit(data);
     *   });
     * });
     *
     * var eventEmitter = {
     *   triggerEvent: function(data) {
     *     eventEmitter.eventHandler(data);
     *   },
     *   handleEvent: function(handler) {
     *     eventEmitter.eventHandler = handler;
     *   },
     *   eventHandler: function() {}
     * };
     *
     * var events = [];
     *
     * factory(eventEmitter).each(function(e) {
     *   events.push(e);
     * });
     *
     * eventEmitter.triggerEvent('foo');
     * eventEmitter.triggerEvent('bar');
     *
     * events // => ['foo', 'bar']
     */
    Lazy.createWrapper = function createWrapper(initializer) {
      var ctor = function() {
        this.listeners = [];
      };

      ctor.prototype = new StreamLikeSequence();

      ctor.prototype.each = function(listener) {
        this.listeners.push(listener);
      };

      ctor.prototype.emit = function(data) {
        var listeners = this.listeners;

        for (var len = listeners.length, i = len - 1; i >= 0; --i) {
          if (listeners[i](data) === false) {
            listeners.splice(i, 1);
          }
        }
      };

      return function() {
        var sequence = new ctor();
        initializer.apply(sequence, arguments);
        return sequence;
      };
    };

    /**
     * Creates a {@link GeneratedSequence} using the specified generator function
     * and (optionally) length.
     *
     * @public
     * @param {function(number):*} generatorFn The function used to generate the
     *     sequence. This function accepts an index as a parameter and should return
     *     a value for that index in the resulting sequence.
     * @param {number=} length The length of the sequence, for sequences with a
     *     definite length.
     * @returns {GeneratedSequence} The generated sequence.
     *
     * @examples
     * var randomNumbers = Lazy.generate(Math.random);
     * var countingNumbers = Lazy.generate(function(i) { return i + 1; }, 5);
     *
     * randomNumbers          // instanceof Lazy.GeneratedSequence
     * randomNumbers.length() // => undefined
     * countingNumbers          // sequence: [1, 2, 3, 4, 5]
     * countingNumbers.length() // => 5
     */
    Lazy.generate = function generate(generatorFn, length) {
      return new GeneratedSequence(generatorFn, length);
    };

    /**
     * Creates a sequence from a given starting value, up to a specified stopping
     * value, incrementing by a given step. Invalid values for any of these
     * arguments (e.g., a step of 0) result in an empty sequence.
     *
     * @public
     * @returns {GeneratedSequence} The sequence defined by the given ranges.
     *
     * @examples
     * Lazy.range(3)         // sequence: [0, 1, 2]
     * Lazy.range(1, 4)      // sequence: [1, 2, 3]
     * Lazy.range(2, 10, 2)  // sequence: [2, 4, 6, 8]
     * Lazy.range(5, 1, 2)   // sequence: []
     * Lazy.range(5, 15, -2) // sequence: []
     * Lazy.range(3, 10, 3)  // sequence: [3, 6, 9]
     * Lazy.range(5, 2)      // sequence: [5, 4, 3]
     * Lazy.range(7, 2, -2)  // sequence: [7, 5, 3]
     * Lazy.range(3, 5, 0)   // sequence: []
     */
    Lazy.range = function range() {
      var start = arguments.length > 1 ? arguments[0] : 0,
          stop  = arguments.length > 1 ? arguments[1] : arguments[0],
          step  = arguments.length > 2 && arguments[2];

      if (step === false) {
        step = stop > start ? 1 : -1;
      }

      if (step === 0) {
        return Lazy([]);
      }

      return Lazy.generate(function(i) { return start + (step * i); })
        .take(Math.ceil((stop - start) / step));
    };

    /**
     * Creates a sequence consisting of the given value repeated a specified number
     * of times.
     *
     * @public
     * @param {*} value The value to repeat.
     * @param {number=} count The number of times the value should be repeated in
     *     the sequence. If this argument is omitted, the value will repeat forever.
     * @returns {GeneratedSequence} The sequence containing the repeated value.
     *
     * @examples
     * Lazy.repeat("hi", 3)          // sequence: ["hi", "hi", "hi"]
     * Lazy.repeat("young")          // instanceof Lazy.GeneratedSequence
     * Lazy.repeat("young").length() // => undefined
     * Lazy.repeat("young").take(3)  // sequence: ["young", "young", "young"]
     */
    Lazy.repeat = function repeat(value, count) {
      return Lazy.generate(function() { return value; }, count);
    };

    Lazy.Sequence           = Sequence;
    Lazy.ArrayLikeSequence  = ArrayLikeSequence;
    Lazy.ObjectLikeSequence = ObjectLikeSequence;
    Lazy.StringLikeSequence = StringLikeSequence;
    Lazy.StreamLikeSequence = StreamLikeSequence;
    Lazy.GeneratedSequence  = GeneratedSequence;
    Lazy.AsyncSequence      = AsyncSequence;
    Lazy.AsyncHandle        = AsyncHandle;

    /*** Useful utility methods ***/

    /**
     * Creates a shallow copy of an array or object.
     *
     * @examples
     * var array  = [1, 2, 3], clonedArray,
     *     object = { foo: 1, bar: 2 }, clonedObject;
     *
     * clonedArray = Lazy.clone(array); // => [1, 2, 3]
     * clonedArray.push(4); // clonedArray == [1, 2, 3, 4]
     * array; // => [1, 2, 3]
     *
     * clonedObject = Lazy.clone(object); // => { foo: 1, bar: 2 }
     * clonedObject.baz = 3; // clonedObject == { foo: 1, bar: 2, baz: 3 }
     * object; // => { foo: 1, bar: 2 }
     */
    Lazy.clone = function clone(target) {
      return Lazy(target).value();
    };

    /**
     * Marks a method as deprecated, so calling it will issue a console warning.
     */
    Lazy.deprecate = function deprecate(message, fn) {
      return function() {
        console.warn(message);
        return fn.apply(this, arguments);
      };
    };

    var arrayPop   = Array.prototype.pop,
        arraySlice = Array.prototype.slice;

    /**
     * Creates a callback... you know, Lo-Dash style.
     *
     * - for functions, just returns the function
     * - for strings, returns a pluck-style callback
     * - for objects, returns a where-style callback
     *
     * @private
     * @param {Function|string|Object} callback A function, string, or object to
     *     convert to a callback.
     * @param {*} defaultReturn If the callback is undefined, a default return
     *     value to use for the function.
     * @returns {Function} The callback function.
     *
     * @examples
     * createCallback(function() {})                  // instanceof Function
     * createCallback('foo')                          // instanceof Function
     * createCallback('foo')({ foo: 'bar'})           // => 'bar'
     * createCallback({ foo: 'bar' })({ foo: 'bar' }) // => true
     * createCallback({ foo: 'bar' })({ foo: 'baz' }) // => false
     */
    function createCallback(callback, defaultValue) {
      switch (typeof callback) {
        case "function":
          return callback;

        case "string":
          return function(e) {
            return e[callback];
          };

        case "object":
          return function(e) {
            return Lazy(callback).all(function(value, key) {
              return e[key] === value;
            });
          };

        case "undefined":
          return defaultValue ?
            function() { return defaultValue; } :
            Lazy.identity;

        default:
          throw new Error("Don't know how to make a callback from a " + typeof callback + "!");
      }
    }

    /**
     * Takes a function that returns a value for one argument and produces a
     * function that compares two arguments.
     *
     * @private
     * @param {Function|string|Object} callback A function, string, or object to
     *     convert to a callback using `createCallback`.
     * @returns {Function} A function that accepts two values and returns 1 if
     *     the first is greater, -1 if the second is greater, or 0 if they are
     *     equivalent.
     *
     * @examples
     * createComparator('a')({ a: 1 }, { a: 2 });       // => -1
     * createComparator('a')({ a: 6 }, { a: 2 });       // => 1
     * createComparator('a')({ a: 1 }, { a: 1 });       // => 0
     * createComparator()(3, 5);                        // => -1
     * createComparator()(7, 5);                        // => 1
     * createComparator()(3, 3);                        // => 0
     */
    function createComparator(callback, descending) {
      if (!callback) { return compare; }

      callback = createCallback(callback);

      return function(x, y) {
        return compare(callback(x), callback(y));
      };
    }

    /**
     * Takes a function and returns a function with the same logic but the
     * arguments reversed. Only applies to functions w/ arity=2 as this is private
     * and I can do what I want.
     *
     * @private
     * @param {Function} fn The function to "reverse"
     * @returns {Function} The "reversed" function
     *
     * @examples
     * reverseArguments(function(x, y) { return x + y; })('a', 'b'); // => 'ba'
     */
    function reverseArguments(fn) {
      return function(x, y) { return fn(y, x); };
    }

    /**
     * Creates a Set containing the specified values.
     *
     * @param {...Array} values One or more array(s) of values used to populate the
     *     set.
     * @returns {Set} A new set containing the values passed in.
     */
    function createSet(values) {
      var set = new Set();
      Lazy(values || []).flatten().each(function(e) {
        set.add(e);
      });
      return set;
    }

    /**
     * Compares two elements for sorting purposes.
     *
     * @private
     * @param {*} x The left element to compare.
     * @param {*} y The right element to compare.
     * @returns {number} 1 if x > y, -1 if x < y, or 0 if x and y are equal.
     *
     * @examples
     * compare(1, 2)     // => -1
     * compare(1, 1)     // => 0
     * compare(2, 1)     // => 1
     * compare('a', 'b') // => -1
     */
    function compare(x, y) {
      if (x === y) {
        return 0;
      }

      return x > y ? 1 : -1;
    }

    /**
     * Iterates over every element in an array.
     *
     * @param {Array} array The array.
     * @param {Function} fn The function to call on every element, which can return
     *     false to stop the iteration early.
     * @returns {boolean} True if every element in the entire sequence was iterated,
     *     otherwise false.
     */
    function forEach(array, fn) {
      var i = -1,
          len = array.length;

      while (++i < len) {
        if (fn(array[i], i) === false) {
          return false;
        }
      }

      return true;
    }

    function getFirst(sequence) {
      var result;
      sequence.each(function(e) {
        result = e;
        return false;
      });
      return result;
    }

    /**
     * Checks if an element exists in an array.
     *
     * @private
     * @param {Array} array
     * @param {*} element
     * @returns {boolean} Whether or not the element exists in the array.
     *
     * @examples
     * arrayContains([1, 2], 2)              // => true
     * arrayContains([1, 2], 3)              // => false
     * arrayContains([undefined], undefined) // => true
     * arrayContains([NaN], NaN)             // => true
     */
    function arrayContains(array, element) {
      var i = -1,
          length = array.length;

      // Special handling for NaN
      if (element !== element) {
        while (++i < length) {
          if (array[i] !== array[i]) {
            return true;
          }
        }
        return false;
      }

      while (++i < length) {
        if (array[i] === element) {
          return true;
        }
      }
      return false;
    }

    /**
     * Checks if an element exists in an array before a given index.
     *
     * @private
     * @param {Array} array
     * @param {*} element
     * @param {number} index
     * @param {Function} keyFn
     * @returns {boolean}
     *
     * @examples
     * arrayContainsBefore([1, 2, 3], 3, 2) // => false
     * arrayContainsBefore([1, 2, 3], 3, 3) // => true
     */
    function arrayContainsBefore(array, element, index, keyFn) {
      var i = -1;

      if (keyFn) {
        keyFn = createCallback(keyFn);
        while (++i < index) {
          if (keyFn(array[i]) === keyFn(element)) {
            return true;
          }
        }

      } else {
        while (++i < index) {
          if (array[i] === element) {
            return true;
          }
        }
      }

      return false;
    }

    /**
     * Swaps the elements at two specified positions of an array.
     *
     * @private
     * @param {Array} array
     * @param {number} i
     * @param {number} j
     *
     * @examples
     * var array = [1, 2, 3, 4, 5];
     *
     * swap(array, 2, 3) // array == [1, 2, 4, 3, 5]
     */
    function swap(array, i, j) {
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    /**
     * "Clones" a regular expression (but makes it always global).
     *
     * @private
     * @param {RegExp|string} pattern
     * @returns {RegExp}
     */
    function cloneRegex(pattern) {
      return eval("" + pattern + (!pattern.global ? "g" : ""));
    };

    /**
     * A collection of unique elements.
     *
     * @private
     * @constructor
     *
     * @examples
     * var set  = new Set(),
     *     obj1 = {},
     *     obj2 = {},
     *     fn1 = function fn1() {},
     *     fn2 = function fn2() {};
     *
     * set.add('foo')            // => true
     * set.add('foo')            // => false
     * set.add(1)                // => true
     * set.add(1)                // => false
     * set.add('1')              // => true
     * set.add('1')              // => false
     * set.add(obj1)             // => true
     * set.add(obj1)             // => false
     * set.add(obj2)             // => true
     * set.add(fn1)              // => true
     * set.add(fn2)              // => true
     * set.add(fn2)              // => false
     * set.contains('__proto__') // => false
     * set.add('__proto__')      // => true
     * set.add('__proto__')      // => false
     * set.contains('add')       // => false
     * set.add('add')            // => true
     * set.add('add')            // => false
     * set.contains(undefined)   // => false
     * set.add(undefined)        // => true
     * set.contains(undefined)   // => true
     * set.contains('undefined') // => false
     * set.add('undefined')      // => true
     * set.contains('undefined') // => true
     * set.contains(NaN)         // => false
     * set.add(NaN)              // => true
     * set.contains(NaN)         // => true
     * set.contains('NaN')       // => false
     * set.add('NaN')            // => true
     * set.contains('NaN')       // => true
     * set.contains('@foo')      // => false
     * set.add('@foo')           // => true
     * set.contains('@foo')      // => true
     */
    function Set() {
      this.table   = {};
      this.objects = [];
    }

    /**
     * Attempts to add a unique value to the set.
     *
     * @param {*} value The value to add.
     * @returns {boolean} True if the value was added to the set (meaning an equal
     *     value was not already present), or else false.
     */
    Set.prototype.add = function add(value) {
      var table = this.table,
          type  = typeof value,

          // only applies for strings
          firstChar,

          // only applies for objects
          objects;

      switch (type) {
        case "number":
        case "boolean":
        case "undefined":
          if (!table[value]) {
            table[value] = true;
            return true;
          }
          return false;

        case "string":
          // Essentially, escape the first character if it could possibly collide
          // with a number, boolean, or undefined (or a string that happens to start
          // with the escape character!), OR if it could override a special property
          // such as '__proto__' or 'constructor'.
          switch (value.charAt(0)) {
            case "_": // e.g., __proto__
            case "f": // for 'false'
            case "t": // for 'true'
            case "c": // for 'constructor'
            case "u": // for 'undefined'
            case "@": // escaped
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "N": // for NaN
              value = "@" + value;
          }
          if (!table[value]) {
            table[value] = true;
            return true;
          }
          return false;

        default:
          // For objects and functions, we can't really do anything other than store
          // them in an array and do a linear search for reference equality.
          objects = this.objects;
          if (!arrayContains(objects, value)) {
            objects.push(value);
            return true;
          }
          return false;
      }
    };

    /**
     * Checks whether the set contains a value.
     *
     * @param {*} value The value to check for.
     * @returns {boolean} True if the set contains the value, or else false.
     */
    Set.prototype.contains = function contains(value) {
      var type = typeof value,

          // only applies for strings
          firstChar;

      switch (type) {
        case "number":
        case "boolean":
        case "undefined":
          return !!this.table[value];

        case "string":
          // Essentially, escape the first character if it could possibly collide
          // with a number, boolean, or undefined (or a string that happens to start
          // with the escape character!), OR if it could override a special property
          // such as '__proto__' or 'constructor'.
          switch (value.charAt(0)) {
            case "_": // e.g., __proto__
            case "f": // for 'false'
            case "t": // for 'true'
            case "c": // for 'constructor'
            case "u": // for 'undefined'
            case "@": // escaped
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
            case "N": // for NaN
              value = "@" + value;
          }
          return !!this.table[value];

        default:
          // For objects and functions, we can't really do anything other than store
          // them in an array and do a linear search for reference equality.
          return arrayContains(this.objects, value);
      }
    };

    /**
     * A "rolling" queue, with a fixed capacity. As items are added to the head,
     * excess items are dropped from the tail.
     *
     * @private
     * @constructor
     *
     * @examples
     * var queue = new Queue(3);
     *
     * queue.add(1).toArray()        // => [1]
     * queue.add(2).toArray()        // => [1, 2]
     * queue.add(3).toArray()        // => [1, 2, 3]
     * queue.add(4).toArray()        // => [2, 3, 4]
     * queue.add(5).add(6).toArray() // => [4, 5, 6]
     * queue.add(7).add(8).toArray() // => [6, 7, 8]
     *
     * // also want to check corner cases
     * new Queue(1).add('foo').add('bar').toArray() // => ['bar']
     * new Queue(0).add('foo').toArray()            // => []
     * new Queue(-1)                                // throws
     *
     * @benchmarks
     * function populateQueue(count, capacity) {
     *   var q = new Queue(capacity);
     *   for (var i = 0; i < count; ++i) {
     *     q.add(i);
     *   }
     * }
     *
     * function populateArray(count, capacity) {
     *   var arr = [];
     *   for (var i = 0; i < count; ++i) {
     *     if (arr.length === capacity) { arr.shift(); }
     *     arr.push(i);
     *   }
     * }
     *
     * populateQueue(100, 10); // populating a Queue
     * populateArray(100, 10); // populating an Array
     */
    function Queue(capacity) {
      this.contents = new Array(capacity);
      this.start    = 0;
      this.count    = 0;
    }

    /**
     * Adds an item to the queue, and returns the queue.
     */
    Queue.prototype.add = function add(element) {
      var contents = this.contents,
          capacity = contents.length,
          start    = this.start;

      if (this.count === capacity) {
        contents[start] = element;
        this.start = (start + 1) % capacity;

      } else {
        contents[this.count++] = element;
      }

      return this;
    };

    /**
     * Returns an array containing snapshot of the queue's contents.
     */
    Queue.prototype.toArray = function toArray() {
      var contents = this.contents,
          start    = this.start,
          count    = this.count;

      var snapshot = contents.slice(start, start + count);
      if (snapshot.length < count) {
        snapshot = snapshot.concat(contents.slice(0, count - snapshot.length));
      }

      return snapshot;
    };

    /**
     * Shared base method for defining new sequence types.
     */
    function defineSequenceType(base, name, overrides) {
      /** @constructor */
      var ctor = function ctor() {};

      // Make this type inherit from the specified base.
      ctor.prototype = new base();

      // Attach overrides to the new sequence type's prototype.
      for (var override in overrides) {
        ctor.prototype[override] = overrides[override];
      }

      // Define a factory method that sets the new sequence's parent to the caller
      // and (optionally) applies any additional initialization logic.
      // Expose this as a chainable method so that we can do:
      // Lazy(...).map(...).filter(...).blah(...);
      var factory = function factory() {
        var sequence = new ctor();

        // Every sequence needs a reference to its parent in order to work.
        sequence.parent = this;

        // If a custom init function was supplied, call it now.
        if (sequence.init) {
          sequence.init.apply(sequence, arguments);
        }

        return sequence;
      };

      var methodNames = typeof name === 'string' ? [name] : name;
      for (var i = 0; i < methodNames.length; ++i) {
        base.prototype[methodNames[i]] = factory;
      }

      return ctor;
    }

    return Lazy;
  });
  });

  var iter = (lazy && typeof lazy === 'object' && 'default' in lazy ? lazy['default'] : lazy);

  /**
   * Generic message handling class.
   */

  var MessageHandler = function () {
      function MessageHandler() {
          babelHelpers.classCallCheck(this, MessageHandler);

          this._handlers = this._handlers || {};
          this._log = getLogger(this);
          this._mergedHandlers = [];
      }

      babelHelpers.createClass(MessageHandler, [{
          key: "listenTo",
          value: function listenTo(emitter) {
              var _this = this;

              return iter(this._handlers).values().each(function (type) {
                  return emitter.on(type, function () {
                      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                          args[_key] = arguments[_key];
                      }

                      return _this.handle.apply(_this, [type].concat(args));
                  });
              });
          }
      }, {
          key: "merge",
          value: function merge(handlerObject) {
              return this._mergedHandlers.push(handlerObject);
          }
      }, {
          key: "registerHandlers",
          value: function registerHandlers(handlers) {
              var _this2 = this;

              return iter(handlers).pairs().each(function (_ref) {
                  var _ref2 = babelHelpers.slicedToArray(_ref, 2);

                  var type = _ref2[0];
                  var handler = _ref2[1];
                  return _this2.registerHandler(type, handler);
              });
          }
      }, {
          key: "registerHandler",
          value: function registerHandler(type, handler) {
              return this._handlers[type] = handler;
          }
      }, {
          key: "handle",
          value: function handle(type) {
              var _this3 = this;

              for (var _len2 = arguments.length, params = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                  params[_key2 - 1] = arguments[_key2];
              }

              var handler = this._handlers[type];
              this.type = type, this.params = params;

              assert(this.canHandle(type));

              if (handler != null) handler.apply(this, this.params);

              return iter(this._mergedHandlers).filter(function (handler) {
                  return handler.canHandle(type);
              }).each(function (handler) {
                  return handler.handle.apply(_this3, [type].concat(params));
              });
          }
      }, {
          key: "canHandle",
          value: function canHandle(type) {
              if (type in this._handlers) return true;
              return this._mergedHandlers.some(function (handler) {
                  return handler.canHandle(type);
              });
          }
      }]);
      return MessageHandler;
  }();

  /**
   * A wrapper around a webkit notification. Used to display desktop notifications.
   */

  var Notification = function (_EventEmitter) {
      babelHelpers.inherits(Notification, _EventEmitter);

      function Notification(title, message, image) {
          babelHelpers.classCallCheck(this, Notification);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Notification).call(this));

          _this._title = title;
          _this._message = message;
          _this._image = image != null ? image : Notification.defaultImage;
          _this._createNotification();
          _this._addOnClickListener();
          _this._addOnCloseListener();
          return _this;
      }

      babelHelpers.createClass(Notification, [{
          key: "_createNotification",
          value: function _createNotification() {
              return this.notification = new window.Notification(this._title, { "body": this._message, "icon": this._image });
          }
      }, {
          key: "_addOnClickListener",
          value: function _addOnClickListener() {
              var _this2 = this;

              return this.notification.onclick = function () {
                  _this2.cancel();
                  return _this2.emit("clicked");
              };
          }
      }, {
          key: "_addOnCloseListener",
          value: function _addOnCloseListener() {
              var _this3 = this;

              return this.notification.onclose = function () {
                  return _this3.emit("closed");
              };
          }

          /**
           * Display the notification.
           */

      }, {
          key: "show",
          value: function show() {
              // Notifications are automatically shown.
              chrome.app.window.current().drawAttention();
          }

          /**
           * Close the notification.
           */

      }, {
          key: "cancel",
          value: function cancel() {
              if (this.notification) this.notification.close();
              chrome.app.window.current().clearAttention();
          }

          /**
           * Used as a hash function for notifications.
           */

      }, {
          key: "toString",
          value: function toString() {
              return this._title + this._message;
          }
      }]);
      return Notification;
  }(EventEmitter);

  Notification.defaultImage = "http://sourceforge.net/p/acupofjavachat/icon";

  /**
   * Special commands used to make testing easier. These commands are not
   *  displayed in /help.
   */

  var DeveloperCommands = function (_MessageHandler) {
      babelHelpers.inherits(DeveloperCommands, _MessageHandler);


      /**
       * Initialise the Developer Commands
       * @param  {Chat} chat
       */

      function DeveloperCommands(chat) {
          babelHelpers.classCallCheck(this, DeveloperCommands);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(DeveloperCommands).call(this, chat));

          _this._chat = chat;
          return _this;
      }

      babelHelpers.createClass(DeveloperCommands, [{
          key: "_handleCommand",
          value: function _handleCommand(command, text) {
              var _chat;

              text = text || "";
              return (_chat = this._chat).userCommands.apply(_chat, [command, this.params[0]].concat(babelHelpers.toConsumableArray(text.split(" "))));
          }
      }]);
      return DeveloperCommands;
  }(MessageHandler);

  DeveloperCommands.prototype._handlers = {
      "test-notif": function testNotif() {
          return new Notification("test", "hi!").show();
      },
      "test-upgrade-prompt": function testUpgradePrompt() {
          this._chat._promptToUpdate();
      },
      "get-pw": function getPw() {
          return this._chat.displayMessage("notice", this.params[0].context, "Your password is: " + this._chat.remoteConnection._password);
      },
      "set-pw": function setPw(event) {
          var password = event.args[0] || "bacon";
          this._chat.storage._store("password", password);
          return this._chat.setPassword(password);
      }
  };

  /**
   * A notification used when the user's nick is mentioned.
   * Provides functions for determining if a nick was mentioned.
   */

  var NickMentionedNotification = function () {
      /**
       * Creates a notification that's used when the user's nick is mensioned.
       * Provides functions for determining if a nick was mentioned.
       * @param  {any} channel
       * @param  {any} from
       * @param  {any} message
       */

      function NickMentionedNotification(channel, from, message) {
          babelHelpers.classCallCheck(this, NickMentionedNotification);

          this._channel = channel;
          this._from = from;
          this._message = message;
      }

      babelHelpers.createClass(NickMentionedNotification, [{
          key: "getBody",
          value: function getBody() {
              return this._message;
          }
      }, {
          key: "getTitle",
          value: function getTitle() {
              return this._from + " mentioned you in " + this._channel;
          }

          /**
           * When there are multiple notifications, a list of stubs is displayed from
           *  each notification
           */

      }, {
          key: "getStub",
          value: function getStub() {
              return this._from + " mentioned you";
          }
          /**
           * @param  {string} nick
           * @param  {string} msg
           */

      }], [{
          key: "shouldNotify",
          value: function shouldNotify(nick, msg) {
              var msgToTest;
              if (nick == null) return false;
              nick = this._escapeTextForRegex(nick.replace(/_+$/, ""));
              msgToTest = this._prepMessageForRegex(msg, nick);
              return (/\#nick\#_*([!?.]*|[-:;~\*\u0001]?)(?!\S)/i.test(msgToTest)
              );
          }
          /**
           * @param  {string} text
           */

      }, {
          key: "_escapeTextForRegex",
          value: function _escapeTextForRegex(text) {
              return text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
          }
          /**
           * @param  {string} msg
           * @param  {string} nick
           */

      }, {
          key: "_prepMessageForRegex",
          value: function _prepMessageForRegex(msg, nick) {
              msg = msg.replace(/,/g, " ");
              msg = msg.replace(/\#nick\#/gi, "a");
              msg = msg.replace(new RegExp("@\?" + nick, "ig"), "#nick#");
              // simulate a negative lookbehind to make sure only whitespace precedes the nick
              return msg.replace(/\S\#nick\#/i, "a");
          }
      }]);
      return NickMentionedNotification;
  }();

  var arrayBufferConversionCount = 0;

  function createBlob(src) {
      var BB = window.BlobBuilder || window.WebKitBlobBuilder;
      if (BB) {
          var bb = new BB();
          bb.append(src);
          return bb.getBlob();
      }
      return new Blob([src]);
  }

  function concatArrayBuffers(a, b) {
      var result = new ArrayBuffer(a.byteLength + b.byteLength),
          resultView = new Uint8Array(result);

      resultView.set(new Uint8Array(a));
      resultView.set(new Uint8Array(b), a.byteLength);
      return result;
  }

  function string2ArrayBuffer(string, callback) {
      var blob = createBlob(string),
          f = new FileReader();

      arrayBufferConversionCount++;
      f.onload = function (e) {
          arrayBufferConversionCount--;
          return callback(e.target.result);
      };
      return f.readAsArrayBuffer(blob);
  }

  function arrayBuffer2String(buf, callback) {
      var blob = createBlob(buf),
          f = new FileReader();

      arrayBufferConversionCount++;
      f.onload = function (e) {
          arrayBufferConversionCount--;
          return callback(e.target.result);
      };
      return f.readAsText(blob);
  }

  var parseCommand = function () {
      var partsRegx = /^(?::([^\x20]+?)\x20)?([^\x20]+?)((?:\x20[^\x20:][^\x20]*)+)?(?:\x20:(.*))?$/;
      return function _parseCommand(data) {
          var str = $.trim(data.toString("utf8"));
          var parts = partsRegx.exec(str);
          if (!parts) {
              throw new Error("invalid IRC message: " + data);
          }
          /*
          * Could do more validation here...
          * prefix = servername | nickname((!user)?@host)?
          * command = letter+ | digit{3}
          * params has weird stuff going on when there are 14 arguments
          */
          // trim whitespace
          if (parts[3] != null) parts[3] = parts[3].slice(1).split(/\x20/);else parts[3] = [];

          if (parts[4] != null) parts[3].push(parts[4]);
          return {
              prefix: parts[1],
              command: parts[2],
              params: parts[3]
          };
      };
  }();

  function hashString(s) {
      var ret = 0;
      for (var i = 0, len = s.length; i < len; i++) {
          ret = 31 * ret + s.charCodeAt(i) << 0;
      }
      return Math.abs(ret);
  }

  function parsePrefix(prefix) {
      var p = /^([^!]+?)(?:!(.+?)(?:@(.+?))?)?$/.exec(prefix);
      return {
          nick: p[1],
          user: p[2],
          host: p[3]
      };
  }

  var resolveParams = function () {
      var spacesColons = /^:|\x20/,
          errorString = "some non-final arguments had spaces or initial colons in them";

      return function (params) {
          var last = params.length - 1,
              lastArgIsMsg = params.length > 1 ? params[last] : false;

          if (lastArgIsMsg === true) {
              params.pop();
              last -= 1;
          }

          if (params && params.length > 0) {
              if (params.slice(0, last).some(function (p) {
                  return spacesColons.test(p);
              })) {
                  throw new Error(errorString + "\n[PARAMS] " + JSON.stringify(params));
              }
              if (spacesColons.test(params[last]) || lastArgIsMsg === true) {
                  params[last] = ":" + params[last];
              }
              return params.join(" ");
          } else {
              return "";
          }
      };
  }();

  function makeCommand(cmd) {
      for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          params[_key - 1] = arguments[_key];
      }

      return cmd + " " + resolveParams(params) + "\r\n";
  }

  function randomName(length) {
      var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      if (length == null) length = 10;
      return Array(length).fill().map(function () {
          return chars[Math.floor(Math.random() * chars.length)];
      }).join("");
  }

  function normaliseNick(nick) {
      return nick.toLowerCase().replace(/[\[\]\\]/g, function (x) {
          return {
              "[": "{",
              "]": "}",
              "|": "\\"
          }[x];
      });
  }

  function nicksEqual(a, b) {
      var _ref2;
      if (!((typeof a === "undefined" ? "undefined" : babelHelpers.typeof(a)) === (_ref2 = typeof b === "undefined" ? "undefined" : babelHelpers.typeof(b)) && _ref2 === "string")) {
          return false;
      }
      return a != null && b != null && normaliseNick(a) === normaliseNick(b);
  }

  function toSocketData(str, cb) {
      return string2ArrayBuffer(str, function (ab) {
          return cb(ab);
      });
  }

  function fromSocketData(ab, cb) {
      return arrayBuffer2String(ab, cb);
  }

  function emptySocketData() {
      return new ArrayBuffer(0);
  }

  function concatSocketData(a, b) {
      return concatArrayBuffers(a, b);
  }

  function isConvertingArrayBuffers() {
      return arrayBufferConversionCount > 0;
  }

  /**
   * Converts an array containing uint8 values to an ArrayBuffer.
   * @param {Array.<number>} array An array of values in the range [0, 255].
   * @return {ArrayBuffer} An array buffer containing the byte representation of
   *     the passed in array.
   */
  function arrayToArrayBuffer(array) {
      var arrayBuffer = new ArrayBuffer(array.length);
      var arrayView = new Uint8Array(arrayBuffer);
      arrayView.set(array);
      return arrayBuffer;
  }

var util = Object.freeze({
      get arrayBufferConversionCount () { return arrayBufferConversionCount; },
      parseCommand: parseCommand,
      hashString: hashString,
      parsePrefix: parsePrefix,
      makeCommand: makeCommand,
      randomName: randomName,
      normaliseNick: normaliseNick,
      nicksEqual: nicksEqual,
      toSocketData: toSocketData,
      fromSocketData: fromSocketData,
      emptySocketData: emptySocketData,
      concatSocketData: concatSocketData,
      isConvertingArrayBuffers: isConvertingArrayBuffers,
      arrayToArrayBuffer: arrayToArrayBuffer
  });

  /**
   * Handles formatting and styling text to be displayed to the user.
   *
   * ###Formatting follows these ruels:
   * - all messages start with a capital letter
   * - messages from the user or to the user have the 'self' style
   * - messages from the user are surrounded by parentheses
   * - the user's nick is replaced by 'you'
   * - 'you is' is replaced by 'you are'
   * - messages not from the user end in a period
   */

  var MessageFormatter = function () {
      function MessageFormatter() {
          babelHelpers.classCallCheck(this, MessageFormatter);

          this._customStyle = [];
          this._nick = void 0;
          this.clear();
      }
      /**
       * Sets the user's nick name, which is used to determine if the message is from
       *  or to the user. This field is not reset when clear() is called.
       * @param {string} nick The user's nick name.
       */


      babelHelpers.createClass(MessageFormatter, [{
          key: "setNick",
          value: function setNick(nick) {
              return this._nick = nick;
          }
          /**
           * Sets custom style to be used for all formatted messages. This field is not
           *  reset when clear() is called.
           * @param {string[]} customStyle The style to be set
           */

      }, {
          key: "setCustomStyle",
          value: function setCustomStyle(customStyle) {
              return this._customStyle = customStyle;
          }
          /**
           * Clears the state of the message formatter. Used between formatting different
           *  messages.
           */

      }, {
          key: "clear",
          value: function clear() {
              this._style = [];
              this._fromUs = this._toUs = false;
              this._forcePrettyFormat = void 0;
              return this._message = "";
          }
          /**
           * Sets the message to be formatted.
           * The following can be used as special literals in the message:
           * - '#from' gets replaced by the the nick the message is from.
           * - '#to' gets replaced by the nick the message pertains to.
           * - '#content' gets replaced by content the message is about.
           * @param {string} message
           */

      }, {
          key: "setMessage",
          value: function setMessage(message) {
              return this._message = message;
          }
          /**
           * Returns true if the formatter has a message to format.
           * @return {boolean}
           */

      }, {
          key: "hasMessage",
          value: function hasMessage() {
              return !!this._message;
          }
          /**
           * Set the context of the message.
           * @param {string=} opt_from The nick the message is from.
           * @param {string=} opt_to The nick the message pertains to.
           * @param {string=} opt_content The context of the message.
           */

      }, {
          key: "setContext",
          value: function setContext(opt_from, opt_to, opt_content) {
              this._from = opt_from;
              this._to = opt_to;
              this._content = opt_content;
              this._fromUs = this._isOwnNick(this._from);
              return this._toUs = this._isOwnNick(this._to);
          }
          /**
           * Set the content of the message.
           * @param {string} content
           */

      }, {
          key: "setContent",
          value: function setContent(content) {
              return this._content = content;
          }
          /**
           * Sets the content to the given string and the message to be that content.
           * @param {string} content
           */

      }, {
          key: "setContentMessage",
          value: function setContentMessage(content) {
              this.setContext(void 0, void 0, content);
              this.setContent(content);
              return this.setMessage("#content");
          }
          /**
           * Set whether the message is from the user or not.
           * By default the message is assumed from the user if their nick matches the
           * from field.
           * This is useful for the /nick message, when the user's nick has just changed.
           * @param {boolean} formUs True if the message is from the user
           */

      }, {
          key: "setFromUs",
          value: function setFromUs(fromUs) {
              return this._fromUs = fromUs;
          }
          /**
           * Set whether the message pertains to the user or not.
           * By default the message is assumed to pertain to the user if their nick
           *  matches the to field.
           * This is useful for the /nick message, when the user's nick has just changed.
           * @param {boolean} toUs True if the message is to the user
           */

      }, {
          key: "setToUs",
          value: function setToUs(toUs) {
              return this._toUs = toUs;
          }
          /**
           * Sets whether or not pretty formatting should be used.
           * Pretty formatting includes capitalization and adding a period or adding
           * perentheses.
           */

      }, {
          key: "setPrettyFormat",
          value: function setPrettyFormat(usePrettyFormat) {
              return this._forcePrettyFormat = usePrettyFormat;
          }
      }, {
          key: "_usePrettyFormat",
          value: function _usePrettyFormat() {
              var _ref1;
              return (_ref1 = this._forcePrettyFormat) != null ? _ref1 : !this.hasStyle("no-pretty-format");
          }
          /**
           * Returns a message formatted based on the given context.
           * @return {string} Returns the formatted message.
           */

      }, {
          key: "format",
          value: function format() {
              var msg;
              if (!this._message) {
                  return "";
              }
              msg = this._incorporateContext();
              if (this._usePrettyFormat()) {
                  msg = this._prettyFormat(msg);
              }
              return msg;
          }
          /**
           * Replaces context placeholders, such as '#to', with their corresponding
           *  value.
           * @return {string} Returns the formatted message.
           */

      }, {
          key: "_incorporateContext",
          value: function _incorporateContext() {
              var msg;
              msg = this._message;
              msg = this._fixGrammer("#from", msg);
              msg = msg.replace("#from", this._fromUs ? "you" : this._escapeDollarSign(this._from));
              msg = msg.replace("#to", this._toUs ? "you" : this._escapeDollarSign(this._to));
              return msg.replace("#content", this._escapeDollarSign(this._content));
          }
          /**
           * Escapes dollar signs in text so that they are not interpreted when doing
           * string replacements.
           * @return {string} Returns the escaped string
           */

      }, {
          key: "_escapeDollarSign",
          value: function _escapeDollarSign(text) {
              if (text) {
                  return text.replace("$", "$$$$");
              } else {
                  return text;
              }
          }
          /**
           * Handles adding periods, perentheses and capitalization.
           * @return {string} Returns the formatted message.
           */

      }, {
          key: "_prettyFormat",
          value: function _prettyFormat(msg) {
              if (!this._startsWithNick(msg)) {
                  msg = capitalizeString(msg);
              }
              if (this._fromUs) {
                  msg = "(" + msg + ")";
              } else if (/[a-zA-Z0-9]$/.test(msg)) {
                  msg = msg + ".";
              }
              return msg;
          }
      }, {
          key: "_fixGrammer",
          value: function _fixGrammer(you, msg) {
              var youPlaceholders;
              youPlaceholders = [];
              if (this._fromUs) {
                  youPlaceholders.push("#from");
              }
              if (this._toUs) {
                  youPlaceholders.push("#to");
              }

              return youPlaceholders.reduce(function (msg, you) {
                  return msg.replace(you + " is", you + " are").replace(you + " has", you + " have");
              }, msg);
          }
          /**
           * Returns true if the given message starts with the nick the message pertains
           * to or the nick the message is being sent from.
           */

      }, {
          key: "_startsWithNick",
          value: function _startsWithNick(msg) {
              var startsWithFromNick, startsWithToNick;
              startsWithToNick = msg.indexOf(this._to) === 0 && !this._toUs;
              startsWithFromNick = msg.indexOf(this._from) === 0 && !this._fromUs;
              return startsWithToNick || startsWithFromNick;
          }
          /**
           * Clears the current style and adds the given style.
           * @param {string} style
           */

      }, {
          key: "setStyle",
          value: function setStyle(style) {
              return this._style = [style];
          }
          /**
           * Adds the given style.
           * @param {string[]} style
           */

      }, {
          key: "addStyle",
          value: function addStyle(style) {
              if (!Array.isArray(style)) {
                  style = [style];
              }
              return this._style = this._style.concat(style);
          }
      }, {
          key: "hasStyle",
          value: function hasStyle(style) {
              return this._customStyle.indexOf(style) >= 0 || this._style.indexOf(style) >= 0;
          }
          /**
           * Returns the style of the message.
           * @param {string} style The combination of the added styles and custom styles.
           * @return {string} A space delimited string of styles to apply to the message.
           */

      }, {
          key: "getStyle",
          value: function getStyle() {
              var style = this._customStyle.concat(this._style);
              if (this._fromUs || this._toUs) {
                  style.push("self");
              }
              return style.join(" ");
          }

          /**
           * Returns true if the user's nick equals the given nick.
           * @param nick The nick the check against
           * @return {boolean}
           */

      }, {
          key: "_isOwnNick",
          value: function _isOwnNick(nick) {
              return nicksEqual(this._nick, nick);
          }
      }]);
      return MessageFormatter;
  }();

  var Context = function () {
      function Context(server, channel) {
          babelHelpers.classCallCheck(this, Context);

          this.server = server;
          this.channel = channel;
      }

      babelHelpers.createClass(Context, [{
          key: "toString",
          value: function toString() {
              if (this.channel) {
                  return this.server + " " + this.channel;
              } else {
                  return this.server;
              }
          }
      }, {
          key: "fromString",
          value: function fromString(str) {
              return new (Function.prototype.bind.apply(Context, [null].concat(babelHelpers.toConsumableArray(str.split(" ")))))();
          }
      }, {
          key: "wrap",
          value: function wrap(obj) {
              obj.toString = this.prototype.toString;
              return obj;
          }
      }]);
      return Context;
  }();

  /**
   * Keeps a running chat log.
   */

  var ChatLog = function () {
      function ChatLog() {
          babelHelpers.classCallCheck(this, ChatLog);

          this.add = this.add.bind(this);
          this._entries = {};
          this._whitelist = [];
      }

      /**
       * Returns a raw representation of the chat log which can be later serialized.
       */


      babelHelpers.createClass(ChatLog, [{
          key: "getData",
          value: function getData() {
              return this._entries;
          }

          /**
           * Load chat history from another chat log's data.
           * @param {Object.<Context, string>} serializedChatLog
           */

      }, {
          key: "loadData",
          value: function loadData(serializedChatLog) {
              return this._entries = serializedChatLog;
          }
      }, {
          key: "whitelist",
          value: function whitelist() {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
              }

              return this._whitelist = this._whitelist.concat(args);
          }
      }, {
          key: "add",
          value: function add(context, types, content) {
              var entryList, _base, _ref1;
              if (!this._hasValidType(types.split(" "))) {
                  return;
              }
              entryList = (_ref1 = (_base = this._entries)[context]) != null ? _ref1 : _base[context] = [];
              entryList.push(content);
              if (entryList.length > ChatLog.MAX_ENTRIES_PER_SERVER) {
                  return entryList.splice(0, 25);
              }
          }
      }, {
          key: "_hasValidType",
          value: function _hasValidType(types) {
              var _this = this;

              return types.some(function (type) {
                  return _this._whitelist.indexOf(type) >= 0;
              });
          }
      }, {
          key: "getContextList",
          value: function getContextList() {
              return Object.keys(this._entries).map(function (context) {
                  return Context.fromString(context);
              });
          }
      }, {
          key: "get",
          value: function get(context) {
              var _ref1;
              return (_ref1 = this._entries[context]) != null ? _ref1.join(" ") : void 0;
          }
      }]);
      return ChatLog;
  }();

  ChatLog.MAX_ENTRIES_PER_SERVER = 1000;

  /**
   * The formatter.setMessage() method accepts placeholder variables (#to, #from,
   *  #content). By default, the first argument replaces #from, the 2nd argument
   *  replaces #to and the last argument replaces #content.
   */
  var HANDLERS = {
      topic: function topic(from, _topic) {
          this._chat.updateStatus();
          this._formatter.setContent(_topic);
          if (!_topic) {
              this._formatter.addStyle("notice");
              return this._formatter.setMessage("no topic is set");
          } else if (!from) {
              this._formatter.addStyle("notice");
              return this._formatter.setMessage("the topic is: #content");
          } else {
              this._formatter.addStyle("update");
              return this._formatter.setMessage("#from changed the topic to: #content");
          }
      },

      /**
       * Display when the topic was set and who it was set by.
       */
      topic_info: function topic_info(who, secondsSinceEpoch) {
          this._formatter.addStyle("notice");
          // The time needs converted to milliseconds since javascript doesn't have a way
          // to set the clock in seconds from epoch
          this._formatter.setContent(getReadableTime(parseInt(secondsSinceEpoch * 1000)));
          this._formatter.setMessage("Topic set by #from on #content.");
          return this._formatter.setPrettyFormat(false);
      },
      list: function list(channel, users, topic) {
          this._formatter.addStyle("list");
          this._formatter.setContent(topic);
          var msg = channel + " " + users + " #content";
          return this._formatter.setMessage(msg);
      },
      join: function join(nick) {
          this._formatter.addStyle("update");
          this._formatter.setMessage("#from joined the channel");
          return this._win.nicks.add(nick);
      },
      part: function part(nick) {
          this._formatter.addStyle("update");
          this._formatter.setMessage("#from left the channel");
          return this._win.nicks.remove(nick);
      },

      /**
       * @param  {any} from
       * @param  {any} to
       * @param  {any} reason
       */
      kick: function kick(from, to) {
          this._formatter.addStyle("update");
          this._formatter.setMessage("#from kicked #to from the channel: #content");
          return this._win.nicks.remove(to);
      },
      nick: function nick(from, to) {
          if (this._isOwnNick(to)) {
              this._formatter.setFromUs(true);
              this._formatter.setToUs(false);
          }
          this._formatter.addStyle("update");
          this._formatter.setMessage("#from is now known as #to");
          if (!this._win.isServerWindow()) {
              this._win.nicks.remove(from);
              return this._win.nicks.add(to);
          }
      },
      mode: function mode(from, to, _mode) {
          if (!to) return;
          this._formatter.addStyle("update");
          this._formatter.setContent(this._getModeMessage(_mode));
          return this._formatter.setMessage("#from #content #to");
      },
      user_mode: function user_mode(who, mode) {
          this._formatter.addStyle("notice");
          this._formatter.setContext(void 0, who, mode);
          return this._formatter.setMessage("#to has modes #content");
      },
      quit: function quit(nick, reason) {
          this._formatter.addStyle("update");
          this._formatter.setMessage("#from has quit: #content");
          this._formatter.setContent(reason);
          return this._win.nicks.remove(nick);
      },
      disconnect: function disconnect() {
          this._formatter.addStyle("update");
          this._formatter.setMessage("Disconnected");
          return this._formatter.setFromUs(true);
      },
      connect: function connect() {
          this._formatter.addStyle("update");
          this._formatter.setMessage("Connected");
          return this._formatter.setFromUs(true);
      },
      privmsg: function privmsg(from, msg) {
          this._formatter.addStyle("update");
          this._handleMention(from, msg);
          return this._formatPrivateMessage(from, msg);
      },
      breakgroup: function breakgroup(msg) {
          if (msg == null) {
              msg = "";
          }
          return this._formatter.setContentMessage(msg);
      },
      error: function error(msg) {
          return this._formatter.setContentMessage(msg);
      },
      system: function system(msg) {
          return this._formatter.setContentMessage(msg);
      },
      notice: function notice(msg) {
          this._formatter.addStyle("notice-group");
          return this._formatter.setContentMessage(msg);
      },
      welcome: function welcome(msg) {
          this._formatter.addStyle("group");
          return this._formatter.setContentMessage(msg);
      },

      /**
       * Generic messages - usually boring server stuff like MOTD.
       */
      other: function other(cmd) {
          this._formatter.addStyle("group");
          return this._formatter.setContentMessage(cmd.params[cmd.params.length - 1]);
      },
      nickinuse: function nickinuse(taken, wanted) {
          var msg;
          this._formatter.addStyle("notice");
          msg = "Nickname " + taken + " already in use.";
          if (wanted) {
              msg += " Trying to get nickname " + wanted + ".";
          }
          return this._formatter.setMessage(msg);
      },
      away: function away(msg) {
          this._chat.updateStatus();
          this._formatter.addStyle("notice");
          return this._formatter.setContentMessage(msg);
      },

      /**
       * @param  {any} from
       * @param  {any} to
       * @param  {any} msg
       */
      kill: function kill() {
          this._formatter.addStyle("notice");
          /**
           * TODO: We can't use 'from' or 'msg' because they are not being properly
           *  parsed by irc.util.parseCommand().
           */
          return this._formatter.setMessage("Kill command used on #to");
      },
      socket_error: function socket_error(errorCode) {
          this._formatter.addStyle("error");
          this._formatter.setToUs(true);
          switch (errorCode) {
              case -15:
                  return this._formatter.setMessage("Disconnected: Remote host closed socket");
              default:
                  return this._formatter.setMessage("Socket Error: " + errorCode);
          }
      }
  };

  /**
   * Displays messages to the user when certain IRC events occur.
   */

  var IRCMessageHandler = function (_MessageHandler) {
      babelHelpers.inherits(IRCMessageHandler, _MessageHandler);

      function IRCMessageHandler(chat) {
          babelHelpers.classCallCheck(this, IRCMessageHandler);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(IRCMessageHandler).call(this, chat));

          _this._chat = chat;
          _this._handlers = HANDLERS;
          _this._suspendNotifications = false;
          _this._formatter = new MessageFormatter();
          _this._chatLog = new ChatLog();
          _this._chatLog.whitelist("privmsg");
          _this._ignoredMessages = {};
          return _this;
      }

      babelHelpers.createClass(IRCMessageHandler, [{
          key: "setSuspendNotifications",
          value: function setSuspendNotifications(suspend) {
              this._suspendNotifications = suspend;
          }

          /**
           * Ignore messages of a certain type when in the specified room.
           * @param {Context} context
           * @param {string} type
           */

      }, {
          key: "ignoreMessageType",
          value: function ignoreMessageType(context, type) {
              var _base;
              if ((_base = this._ignoredMessages)[context] == null) {
                  _base[context] = {};
              }
              this._ignoredMessages[context][type.toLowerCase()] = true;
              return this._chat.storage.ignoredMessagesChanged();
          }

          /**
           * Stop ignoring messages of a certain type when in the specified room.
           * @param {Context} context
           * @param {string} type
           */

      }, {
          key: "stopIgnoringMessageType",
          value: function stopIgnoringMessageType(context, type) {
              type = type.toLowerCase();
              if (!this._ignoredMessages[context][type]) return;
              delete this._ignoredMessages[context][type];
              return this._chat.storage.ignoredMessagesChanged();
          }
      }, {
          key: "getIgnoredMessages",
          value: function getIgnoredMessages() {
              return this._ignoredMessages;
          }
      }, {
          key: "setIgnoredMessages",
          value: function setIgnoredMessages(ignoredMessages) {
              return this._ignoredMessages = ignoredMessages;
          }
      }, {
          key: "getChatLog",
          value: function getChatLog() {
              return this._chatLog.getData();
          }
      }, {
          key: "logMessagesFromWindow",
          value: function logMessagesFromWindow(win) {
              return win.on("message", this._chatLog.add);
          }

          /**
           * Replays the given chatlog so the user can see the conversation they
           * missed.
           */

      }, {
          key: "replayChatLog",
          value: function replayChatLog(opt_chatLogData) {
              if (opt_chatLogData) {
                  this._chatLog.loadData(opt_chatLogData);
              }
              var contextList = this._chatLog.getContextList();
              for (var i = 0, len = contextList.length; i < len; i++) {
                  var context = contextList[i];
                  var win = this._chat.winList.get(context.server, context.channel);
                  if (!win) {
                      continue;
                  }
                  win.rawHTML(this._chatLog.get(context));
              }
          }

          /**
           * Sets which window messages will be displayed on.
           * Call this method before calling handle().
           */

      }, {
          key: "setWindow",
          value: function setWindow(_win) {
              var _ref1;
              this._win = _win;
              return this._formatter.setNick((_ref1 = this._win.conn) != null ? _ref1.irc.nick : void 0);
          }
      }, {
          key: "setCustomMessageStyle",
          value: function setCustomMessageStyle(customStyle) {
              return this._formatter.setCustomStyle(customStyle);
          }
      }, {
          key: "handle",
          value: function handle(type) {
              for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  params[_key - 1] = arguments[_key];
              }

              this._setDefaultValues(params);
              babelHelpers.get(Object.getPrototypeOf(IRCMessageHandler.prototype), "handle", this).apply(this, [type].concat(params));
              return this._sendFormattedMessage();
          }
      }, {
          key: "_setDefaultValues",
          value: function _setDefaultValues(params) {
              var _formatter;

              this.source = "";
              this._formatter.clear();
              return (_formatter = this._formatter).setContext.apply(_formatter, babelHelpers.toConsumableArray(params));
          }
      }, {
          key: "_getModeMessage",
          value: function _getModeMessage(mode) {
              var post, pre;
              pre = mode[0] === "+" ? "gave" : "took";
              post = mode[0] === "+" ? "to" : "from";
              mode = this._getMode(mode);
              return pre + " " + mode + " " + post;
          }
      }, {
          key: "_getMode",
          value: function _getMode(mode) {
              switch (mode[1]) {
                  case "o":
                      return "channel operator status";
                  case "O":
                      return "local operator status";
                  case "v":
                      return "voice";
                  case "i":
                      return "invisible status";
                  case "w":
                      return "wall operator status";
                  case "a":
                      return "away status";
                  default:
                      return mode;
              }
          }
      }, {
          key: "_getUserAction",
          value: function _getUserAction(msg) {
              return (/^\u0001ACTION (.*)\u0001/.exec(msg)
              );
          }
      }, {
          key: "_handleMention",
          value: function _handleMention(from, msg) {
              var nickMentioned, _ref1, _ref2;
              nickMentioned = this._nickWasMentioned(from, msg);
              if (nickMentioned) {
                  this._chat.recordLastUserToMention(this._win.getContext(), from);
                  if (!this._win.isPrivate()) {
                      this._formatter.addStyle("mention");
                  }
                  if (this._shouldNotifyMention()) {
                      this._createNotification(from, msg);
                  }
              }
              if (!this._isFromWindowInFocus()) {
                  this._chat.channelDisplay.activity((_ref1 = this._win.conn) != null ? _ref1.name : void 0, this._win.target);
                  if (nickMentioned) {
                      return this._chat.channelDisplay.mention((_ref2 = this._win.conn) != null ? _ref2.name : void 0, this._win.target);
                  }
              }
          }
      }, {
          key: "_createNotification",
          value: function _createNotification(from, msg) {
              var _this2 = this;

              var notification,
                  win = this._win;
              notification = new NickMentionedNotification(win.target, from, msg);
              win.notifications.add(notification);
              return win.notifications.on("clicked", function () {
                  var _base;
                  _this2._chat.switchToWindow(win);
                  return typeof (_base = chrome.app.window.current()).focus === "function" ? _base.focus() : void 0;
              });
          }
      }, {
          key: "_nickWasMentioned",
          value: function _nickWasMentioned(from, msg) {
              var _ref1,
                  nick = (_ref1 = this._win.conn) != null ? _ref1.irc.nick : void 0;
              if (this._isOwnNick(from)) {
                  return false;
              }
              if (this._formatter.hasStyle("notice")) {
                  return false;
              }
              if (this._formatter.hasStyle("direct")) {
                  return false;
              }
              if (this._win.isPrivate()) {
                  return true;
              }
              return NickMentionedNotification.shouldNotify(nick, msg);
          }
      }, {
          key: "_shouldNotifyMention",
          value: function _shouldNotifyMention() {
              return !this._suspendNotifications && (!this._isFromWindowInFocus() || !window.document.hasFocus());
          }
      }, {
          key: "_isFromWindowInFocus",
          value: function _isFromWindowInFocus() {
              return this._win.equals(this._chat.currentWindow);
          }
      }, {
          key: "_formatPrivateMessage",
          value: function _formatPrivateMessage(from, msg) {
              var m = this._getUserAction(msg);
              this._formatter.setMessage("#content");
              this._formatter.setPrettyFormat(false);
              if (m) {
                  this._formatter.setContent(from + " " + m[1]);
                  return this._formatter.addStyle("action");
              } else {
                  if (this._formatter.hasStyle("notice")) {
                      this.source = "- " + from + " -";
                  } else if (this._formatter.hasStyle("direct")) {
                      this.source = "> " + from + " <";
                  } else {
                      this.source = from;
                  }
                  return this._formatter.setContent(msg);
              }
          }
      }, {
          key: "_sendFormattedMessage",
          value: function _sendFormattedMessage() {
              if (!this._formatter.hasMessage() || this._shouldIgnoreMessage(this._win.getContext(), this.type)) {
                  return;
              }
              this._formatter.addStyle(this.type);
              return this._win.message(this.source, this._formatter.format(), this._formatter.getStyle());
          }
      }, {
          key: "_shouldIgnoreMessage",
          value: function _shouldIgnoreMessage(context, type) {
              var _ref1;
              return (_ref1 = this._ignoredMessages[context]) != null ? _ref1[type] : void 0;
          }
      }, {
          key: "_isOwnNick",
          value: function _isOwnNick(nick) {
              var conn = this._win.conn;
              return conn != null ? conn.irc.isOwnNick(nick) : void 0;
          }
      }]);
      return IRCMessageHandler;
  }(MessageHandler);

  var version = "0.7.1";

  var PROJECT_URL = "http://flackr.github.com/circ";
  var ISSUES_URL = "https://github.com/flackr/circ/issues";
  // Should match the version in the manifest.
  var VERSION = version;

  /**
   * Handles CTCP requests such as VERSION, PING, etc.
   */

  var CTCPHandler = function () {
      function CTCPHandler() {
          babelHelpers.classCallCheck(this, CTCPHandler);

          /*
           * TODO: Respond with this message when an unknown query is seen.
           */
          this._error = CTCPHandler.DELIMITER + "ERRMSG" + CTCPHandler.DELIMITER;
      }

      babelHelpers.createClass(CTCPHandler, [{
          key: "isCTCPRequest",
          value: function isCTCPRequest(msg) {
              if (!/\u0001[\w\s]*\u0001/.test(msg)) {
                  return false;
              }
              return this.getResponses(msg).length > 0;
          }
      }, {
          key: "getReadableName",
          value: function getReadableName(msg) {
              return this._parseMessage(msg)[0];
          }
      }, {
          key: "getResponses",
          value: function getResponses(msg) {
              var _this = this;

              var parsed = this._parseMessage(msg),
                  type = parsed[0],
                  responses = this._getResponseText(type, parsed[1]);

              return responses.map(function (response) {
                  return _this._createCTCPResponse(type, response);
              });
          }

          /**
           * Parses the type and arguments from a CTCP request.
           * @param {string} msg CTCP message in the format: '\0001TYPE ARG1 ARG2\0001'.
           *     Note: \0001 is a single character.
           * @return {string, string[]} Returns the type and the args.
           */

      }, {
          key: "_parseMessage",
          value: function _parseMessage(msg) {
              var parsed = msg.slice(1, +(msg.length - 2) + 1 || 9e9).split(" "),
                  type = parsed[0],
                  args = 2 <= parsed.length ? parsed.slice(1) : [];
              return [type, args];
          }

          /**
           * @return {string[]} Returns the unformatted responses to a CTCP request.
           */

      }, {
          key: "_getResponseText",
          value: function _getResponseText(type, args) {
              /*
               * TODO support the o ther types found here:
               * http://www.irchelp.org/irchelp/rfc/ctcpspec.html
               */

              var environment, name;
              switch (type) {
                  case "VERSION":
                      name = "CIRC";
                      environment = "Chrome";
                      return [" " + [name, VERSION, environment].join(" ")];
                  case "SOURCE":
                      return [" https://github.com/flackr/circ/"];
                  case "PING":
                      return [" " + args[0]];
                  case "TIME":
                      var d = new Date();
                      return [" " + d.toUTCString()];
                  default:
                      return [];
              }
          }

          /**
           * @return {string} Returns a correctly formatted response to a CTCP request.
           */

      }, {
          key: "_createCTCPResponse",
          value: function _createCTCPResponse(type, response) {
              return "" + (CTCPHandler.DELIMITER + type + response + CTCPHandler.DELIMITER);
          }
      }]);
      return CTCPHandler;
  }();

  CTCPHandler.DELIMITER = "\u0001";

  /**
   * A generic event often used in conjuction with emit().
   */

  var Event$1 = function () {
      function Event(type, name) {
          babelHelpers.classCallCheck(this, Event);

          this.type = type;
          this.name = name;

          for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
              args[_key - 2] = arguments[_key];
          }

          this.args = args;

          /**
           * Info on which window the event took place in.
           */
          this.context = {};
          /**
           * Effects how the event is displayed.
           */
          this.style = [];
          /**
           * Acts as an id for the event.
           */
          this.hook = this.type + " " + this.name;
      }

      babelHelpers.createClass(Event, [{
          key: "setContext",
          value: function setContext(server, channel) {
              return this.context = {
                  server: server,
                  channel: channel
              };
          }
          /**
           * Adds a custom style for the event that will effect how it's contents are
           *  displayed.
           * @param {Array.<string>} style
           */

      }, {
          key: "addStyle",
          value: function addStyle(style) {
              if (!Array.isArray(style)) {
                  style = [style];
              }
              return this.style = this.style.concat(style);
          }
      }]);
      return Event;
  }();

  Event$1.wrap = function (obj) {
      var event;
      if (obj instanceof Event$1) {
          return obj;
      }
      event = new (Function.prototype.bind.apply(Event$1, [null].concat([obj.type, obj.name], babelHelpers.toConsumableArray(obj.args))))();
      event.setContext(obj.context.server, obj.context.channel);
      return event;
  };

  var handlers = {
      // RPL_WELCOME
      1: function _(from, nick, msg) {
          var _this = this;

          if (this.irc.state === "disconnecting") {
              this.irc.quit();
              return;
          }
          this.irc.nick = nick;
          this.irc.state = "connected";
          this.irc.emit("connect");
          this.irc.emitMessage("welcome", Chat.SERVER_WINDOW, msg);

          return iter(this.irc.channels).pairs().map(function (_ref) {
              var _ref2 = babelHelpers.slicedToArray(_ref, 2);

              var chanName = _ref2[0];
              var channel = _ref2[1];
              return channel.key ? _this.irc.send("JOIN", chanName, channel.key) : _this.irc.send("JOIN", chanName);
          }).toArray();
      },

      // RPL_ISUPPORT
      // We might get multiple, so this just adds to the support object.
      5: function _() {
          var _this2 = this;

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
          }

          // Parameters passed in arguments, pull out the parts we want.
          iter(args.slice(2, args.length - 1)).map(function (arg) {
              return arg.split(/=/, 2);
          }).async(0).each(function (param) {
              var k = param[0].toLowerCase();
              if (param.length === 1) _this2.irc.support[k] = true;else _this2.irc.support[k] = param[1];
          });
      },

      // RPL_NAMREPLY
      353: function _(from, target, privacy, channel, names) {
          var newNameSeq,
              lcChan = channel.toLowerCase(),
              partialNs = this.irc.partialNameLists,
              _ref1 = partialNs[lcChan],
              nameList = _ref1 != null ? _ref1 : partialNs[lcChan] = {};

          newNameSeq = iter(names.split(/\x20/)).map(function (name) {
              return name.replace(/^[~&@%+]/, "");
          }).compact();

          newNameSeq.async(0).each(function (name) {
              nameList[normaliseNick(name)] = name;
          });

          return this.irc.emit("names", channel, newNameSeq.toArray());
      },

      // RPL_ENDOFNAMES
      366: function _(from, target, channel) {
          var lCChannel = channel.toLowerCase();
          if (this.irc.channels[lCChannel]) {
              this.irc.channels[lCChannel].names = this.irc.partialNameLists[lCChannel];
          }
          return delete this.irc.partialNameLists[channel.toLowerCase()];
      },

      NICK: function NICK(from, newNick) {
          var _this3 = this;

          var normNick = this.irc.util.normaliseNick(from.nick),
              newNormNick = this.irc.util.normaliseNick(newNick),
              commonChans = iter(this.irc.channels).pairs().filter(function (_ref3) {
              var _ref4 = babelHelpers.slicedToArray(_ref3, 2);

              var chan = _ref4[1];
              return !(normNick in chan.names);
          });

          if (this.irc.isOwnNick(from.nick)) {
              this.irc.nick = newNick;
              this.irc.emit("nick", newNick);
              this.irc.emitMessage("nick", Chat.SERVER_WINDOW, from.nick, newNick);
          }
          // Update channel names list
          commonChans.each(function (_ref5) {
              var _ref6 = babelHelpers.slicedToArray(_ref5, 2);

              var chan = _ref6[1];

              delete chan.names[normNick];
              chan.names[newNormNick] = newNick;
          });
          return commonChans.map(function (_ref7) {
              var _ref8 = babelHelpers.slicedToArray(_ref7, 1);

              var chanName = _ref8[0];
              return _this3.irc.emitMessage("nick", chanName, from.nick, newNick);
          });
      },

      JOIN: function JOIN(from, chanName) {
          var chan = this.irc.channels[chanName.toLowerCase()];
          if (this.irc.isOwnNick(from.nick)) {
              if (chan != null) {
                  chan.names = [];
              } else {
                  chan = this.irc.channels[chanName.toLowerCase()] = {
                      channel: chanName,
                      names: []
                  };
              }
              this.irc.emit("joined", chanName);
          }
          if (chan) {
              chan.names[this.irc.util.normaliseNick(from.nick)] = from.nick;
              return this.irc.emitMessage("join", chanName, from.nick);
          } else {
              return console.warn("Got JOIN for channel we're not in (" + chan + ")");
          }
      },

      PART: function PART(from, chan) {
          var c = this.irc.channels[chan.toLowerCase()];
          if (c) {
              if (this.irc.isOwnNick(from.nick)) {
                  delete this.irc.channels[chan.toLowerCase()];
                  return this.irc.emit("parted", chan);
              } else {
                  delete c.names[this.irc.util.normaliseNick(from.nick)];
                  return this.irc.emitMessage("part", chan, from.nick);
              }
          } else {
              return console.warn("Got PART for a channel we're not in: " + chan);
          }
      },

      INVITE: function INVITE(from, target, channel) {
          return this.irc.emitMessage("notice", Chat.CURRENT_WINDOW, from.nick + " invites you to join " + channel);
      },

      QUIT: function QUIT(from, reason) {
          var _this4 = this;

          var normNick = this.irc.util.normaliseNick(from.nick);

          return iter(this.irc.channels).pairs().filter(function (_ref9) {
              var _ref10 = babelHelpers.slicedToArray(_ref9, 2);

              var chan = _ref10[1];
              return normNick in chan.names;
          }).each(function (_ref11) {
              var _ref12 = babelHelpers.slicedToArray(_ref11, 2);

              var chanName = _ref12[0];
              var chan = _ref12[1];

              delete chan.names[normNick];
              _this4.irc.emitMessage("quit", chanName, from.nick, reason);
          });
      },

      PRIVMSG: function PRIVMSG(from, target, msg) {
          if (this.ctcpHandler.isCTCPRequest(msg)) {
              return this._handleCTCPRequest(from, target, msg);
          } else {
              return this.irc.emitMessage("privmsg", target, from.nick, msg);
          }
      },

      NOTICE: function NOTICE(from, target, msg) {
          if (!from.user) {
              return this.irc.emitMessage("notice", Chat.SERVER_WINDOW, msg);
          }
          var event = new Event$1("message", "privmsg", from.nick, msg);
          event.setContext(this.irc.server, Chat.CURRENT_WINDOW);
          event.addStyle("notice");
          return this.irc.emitCustomMessage(event);
      },

      PING: function PING(from, payload) {
          return this.irc.send("PONG", payload);
      },
      /**
       * @param  {any} from
       * @param  {any} payload
       */
      PONG: function PONG() {},

      TOPIC: function TOPIC(from, channel, topic) {
          if (this.irc.channels[channel.toLowerCase()] != null) {
              this.irc.channels[channel.toLowerCase()].topic = topic;
              return this.irc.emitMessage("topic", channel, from.nick, topic);
          } else {
              return console.warn("Got TOPIC for a channel we're not in (" + channel + ")");
          }
      },

      KICK: function KICK(from, channel, to, reason) {
          if (!this.irc.channels[channel.toLowerCase()]) {
              console.warn("Got KICK message from " + from + " to " + to + " in channel we are not in (" + channel + ")");
              return;
          }
          delete this.irc.channels[channel.toLowerCase()].names[to];
          this.irc.emitMessage("kick", channel, from.nick, to, reason);
          if (this.irc.isOwnNick(to)) {
              this.irc.emit("parted", channel);
          }
      },

      MODE: function MODE(from, chan, modeList) {
          var _this5 = this;

          for (var _len2 = arguments.length, toList = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
              toList[_key2 - 3] = arguments[_key2];
          }

          if (toList.length < 1) return;

          iter(modeList.split(/(?=[+-]\w)/)).map(function (modes) {
              return iter(modes.split("")).slice(1).map(function (mode) {
                  return modes[0] + mode;
              });
          }).flatten().zip(toList).each(function (_ref13) {
              var _ref14 = babelHelpers.slicedToArray(_ref13, 2);

              var mode = _ref14[0];
              var argument = _ref14[1];
              return _this5.irc.emitMessage("mode", chan, from.nick, argument, mode);
          });
          return;
      },

      // RPL_UMODEIS
      221: function _(from, to, mode) {
          return this.irc.emitMessage("user_mode", Chat.CURRENT_WINDOW, to, mode);
      },

      // RPL_AWAY
      301: function _(from, to, nick, msg) {
          return this._emitUserNotice(to, nick, "is away: " + msg);
      },

      // RPL_UNAWAY
      305: function _(from, to, msg) {
          this.irc.away = false;
          return this.irc.emitMessage("away", Chat.CURRENT_WINDOW, msg);
      },

      // RPL_NOWAWAY
      306: function _(from, to, msg) {
          this.irc.away = true;
          return this.irc.emitMessage("away", Chat.CURRENT_WINDOW, msg);
      },

      /**
       * RPL_WHOISHELPOP (and others; overloaded).
       * Not useful; drop it
       * @param  {any} from
       * @param  {any} to
       * @param  {any} nick
       * @param  {any} msg
       */
      310: function _() {},

      // RPL_WHOISUSER
      311: function _(from, to, nick, user, addr, _2, info) {
          var message = "is " + nick + "!" + user + "@" + addr + " (" + info + ")";
          return this._emitUserNotice(to, nick, message);
      },

      // RPL_WHOISSERVER
      312: function _(from, to, nick, server, desc) {
          return this._emitUserNotice(to, nick, "connected via " + server + " (" + desc + ")");
      },

      // RPL_WHOISOPERATOR (is an IRCOp)
      313: function _(from, to, nick, msg) {
          // server supplies the message text
          return this._emitUserNotice(to, nick, msg);
      },

      // RPL_WHOWASUSER
      314: function _(from, to, nick, user, addr, _3, info) {
          var message = "was " + nick + "!" + user + "@" + addr + " (" + info + ")";
          return this._emitUserNotice(to, nick, message);
      },

      // RPL_ENDOFWHO
      315: function _(from, to, nick, msg) {
          // server supplies the message text
          return this.irc.emitMessage("notice", Chat.SERVER_WINDOW, msg);
      },

      // RPL_WHOISIDLE
      317: function _(from, to, nick, seconds, signon) {
          var date = getReadableTime(parseInt(signon) * 1000),
              message = "has been idle for " + seconds + " seconds, and signed on at: " + date;
          return this._emitUserNotice(to, nick, message);
      },

      // RPL_ENDOFWHOIS
      318: function _(from, to, nick, msg) {
          // server supplies the message text
          return this._emitUserNotice(to, nick, msg);
      },

      // RPL_WHOISCHANNELS
      319: function _(from, to, nick, channels) {
          return this._emitUserNotice(to, nick, "is on channels: " + channels);
      },

      //321 LIST START
      //322 LIST ENTRY
      //323 END OF LIST
      322: function _(from, to, channel, users, topic) {
          //var message = `${channel} ${users} ${topic}`;
          return this.irc.emitMessage("list", Chat.SERVER_WINDOW, channel, users, topic);
      },

      // RPL_CHANNELMODEIS
      324: function _(from, to, channel, mode, modeParams) {
          var message = "Channel modes: " + mode + " " + (modeParams || "");
          return this.irc.emitMessage("notice", channel, message);
      },

      // RPL_CHANNELCREATED
      329: function _(from, to, channel, secondsSinceEpoch) {
          var message = "Channel created on " + getReadableTime(parseInt(secondsSinceEpoch * 1000));
          return this.irc.emitMessage("notice", channel, message);
      },

      // RPL_WHOISACCOUNT (NickServ registration)
      330: function _(from, to, nick, loggedin, msg) {
          return this._emitUserNotice(to, nick, msg + " " + loggedin);
      },

      /**
       * RPL_NOTOPIC
       * @param  {any} from
       * @param  {any} to
       * @param  {any} channel
       * @param  {any} msg
       */
      331: function _(from, to, channel) {
          return this.handle("TOPIC", {}, channel);
      },

      // RPL_TOPIC
      332: function _(from, to, channel, topic) {
          return this.handle("TOPIC", {}, channel, topic);
      },

      // RPL_TOPICWHOTIME
      333: function _(from, to, channel, who, time) {
          return this.irc.emitMessage("topic_info", channel, who, time);
      },

      // RPL_WHOISACTUALLY (ircu, and others)
      338: function _(from, to, nick, realident, realip, msg) {
          var message = "is actually " + realident + "/" + realip + " (" + msg + ")";
          return this._emitUserNotice(to, nick, message);
      },

      // RPL_WHOREPLY
      352: function _(from, to, chan, ident, addr, serv, nick, flags, data) {
          var space = data.indexOf(" ");
          var m1 = chan + ": " + nick;
          var m2 = flags.substring(0, 1) == "G" ? " (AWAY)" : "";
          var m3 = " | " + ident + "@" + addr + " (" + data.substring(space + 1) + ") | via " + serv + ", hops " + data.substring(0, space);
          return this.irc.emitMessage("notice", Chat.SERVER_WINDOW, m1 + m2 + m3);
      },

      // RPL_ENDOFWHOWAS
      369: function _(from, to, nick, msg) {
          // server supplies the message text
          return this._emitUserNotice(to, nick, msg);
      },

      /**
       * Overloaded by Freenode, ignorable WHOIS reply (repeat of info in 311)
       * @param  {any} from
       * @param  {any} to
       * @param  {any} nick
       * @param  {any} msg
       */
      378: function _() {},

      // ERR_NICKNAMEINUSE
      433: function _(from, nick, taken) {
          var newNick = taken + "_";
          if (nick === newNick) {
              newNick = void 0;
          }
          this.irc.emitMessage("nickinuse", Chat.CURRENT_WINDOW, taken, newNick);
          if (newNick) {
              return this.irc.send("NICK", newNick);
          }
      },

      // RPL_WHOISSECURE
      671: function _(from, to, nick, msg) {
          // server supplies the message text
          return this._emitUserNotice(to, nick, msg);
      },

      // The default error handler for error messages. This handler is used for
      // all 4XX error messages unless a handler is explicitly specified.
      //
      // Messages are displayed in the following format:
      // "<arg1> <arg2> ... <argn>: <message>
      //
      error: function error(from, to) {
          for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
              args[_key3 - 2] = arguments[_key3];
          }

          var message,
              msg = args[args.length - 1];
          args.pop();
          if (args.length > 0) {
              message = args.join(" ") + " :" + msg;
          } else {
              message = msg;
          }
          return this.irc.emitMessage("error", Chat.CURRENT_WINDOW, message);
      },

      KILL: function KILL(from, victim, killer, msg) {
          return this.irc.emitMessage("kill", Chat.CURRENT_WINDOW, killer.nick, victim, msg);
      }
  };

  /**
   * Handles messages from an IRC server
   * Good references for numeric (raw) response codes:
   * https://www.alien.net.au/irc/irc2numerics.html
   * http://www.mirc.org/mishbox/reference/rawhelp.htm
   */

  var ServerResponseHandler = function (_MessageHandler) {
      babelHelpers.inherits(ServerResponseHandler, _MessageHandler);

      function ServerResponseHandler(irc) {
          babelHelpers.classCallCheck(this, ServerResponseHandler);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ServerResponseHandler).call(this));

          _this.irc = irc;
          _this.ctcpHandler = new CTCPHandler();
          return _this;
      }

      babelHelpers.createClass(ServerResponseHandler, [{
          key: "canHandle",
          value: function canHandle(type) {
              if (this._isErrorMessage(type)) {
                  return true;
              } else {
                  return babelHelpers.get(Object.getPrototypeOf(ServerResponseHandler.prototype), "canHandle", this).call(this, type);
              }
          }
          /**
           * Handle a message of the given type. Error messages are handled with the
           *  default error handler unless a handler is explicitly specified.
           * @param  {string} type The type of message (e.g. PRIVMSG).
           * @param  {any} ...params A variable number of arguments.
           */

      }, {
          key: "handle",
          value: function handle(type) {
              if (this._isErrorMessage(type) && !(type in this._handlers)) {
                  type = "error";
              }

              for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                  params[_key - 1] = arguments[_key];
              }

              return babelHelpers.get(Object.getPrototypeOf(ServerResponseHandler.prototype), "handle", this).apply(this, [type].concat(params));
          }
      }, {
          key: "_isErrorMessage",
          value: function _isErrorMessage(type) {
              var _ref1;
              return 400 <= (_ref1 = parseInt(type)) && _ref1 < 600;
          }
      }, {
          key: "_handleCTCPRequest",
          value: function _handleCTCPRequest(from, target, msg) {
              var _this2 = this;

              var name = this.ctcpHandler.getReadableName(msg),
                  message = "Received a CTCP " + name + " from " + from.nick;
              this.irc.emitMessage("notice", Chat.CURRENT_WINDOW, message);
              return this.ctcpHandler.getResponses(msg).map(function (response) {
                  return _this2.irc.doCommand("NOTICE", from.nick, response, true);
              });
          }

          /**
           * Called by various nick-specific raw server responses (e.g., /WHOIS responses)
           * @param  {any} to
           * @param  {any} nick
           * @param  {any} msg
           */

      }, {
          key: "_emitUserNotice",
          value: function _emitUserNotice(to, nick, msg) {
              var event = new Event$1("message", "privmsg", nick, msg);
              event.setContext(this.irc.server, to);
              event.addStyle("notice");
              return this.irc.emitCustomMessage(event);
          }
      }]);
      return ServerResponseHandler;
  }(MessageHandler);

  ServerResponseHandler.prototype._handlers = handlers;

  /**
   * Abstract TCP socket.
   * ####Events emitted:
   * - 'connect': the connection succeeded, proceed.
   * - 'data': data received. Argument is the data (array of longs, atm)
   * - 'end': the other end sent a FIN packet, and won't accept any more data.
   * - 'error': an error occurred. The socket is pretty much hosed now.
   * - 'close': emitted when the socket is fully closed.
   * - 'drain': emitted when the write buffer becomes empty
   * ####TODO:
   * Investigate how node deals with errors. The docs say 'close' gets sent right
   * after 'error', so they probably destroy the socket.)
   */

  var AbstractTCPSocket = function (_EventEmitter) {
      babelHelpers.inherits(AbstractTCPSocket, _EventEmitter);

      function AbstractTCPSocket() {
          var _Object$getPrototypeO;

          babelHelpers.classCallCheck(this, AbstractTCPSocket);

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
          }

          return babelHelpers.possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(AbstractTCPSocket)).call.apply(_Object$getPrototypeO, [this].concat(args)));
      }
      /**
       * @param  {any} port
       * @param  {any} host
       */


      babelHelpers.createClass(AbstractTCPSocket, [{
          key: "connect",
          value: function connect() {}
          /**
           * @param  {any} data
           */

      }, {
          key: "write",
          value: function write() {}
      }, {
          key: "close",
          value: function close() {}
      }, {
          key: "setTimeout",
          value: function (_setTimeout) {
              function setTimeout(_x, _x2) {
                  return _setTimeout.apply(this, arguments);
              }

              setTimeout.toString = function () {
                  return _setTimeout.toString();
              };

              return setTimeout;
          }(function (ms, callback) {
              var _this2 = this;

              if (ms > 0) {
                  this.timeout = setTimeout(function () {
                      return _this2.emit("timeout");
                  }, ms);
                  this.timeout_ms = ms;
                  if (callback) return this.once("timeout", callback);
              } else if (ms === 0) {
                  clearTimeout(this.timeout);
                  if (callback) {
                      this.removeListener("timeout", callback);
                  }
                  this.timeout = null;
                  return this.timeout_ms = 0;
              }
          })
      }, {
          key: "_active",
          value: function _active() {
              var _this3 = this;

              if (this.timeout) {
                  clearTimeout(this.timeout);
                  return this.timeout = setTimeout(function () {
                      return _this3.emit("timeout");
                  }, this.timeout_ms);
              }
          }
      }]);
      return AbstractTCPSocket;
  }(EventEmitter);

  /**
   * A socket connected to an IRC server. Uses chrome.sockets.tcp.
   */

  var ChromeSocket = function (_AbstractTCPSocket) {
      babelHelpers.inherits(ChromeSocket, _AbstractTCPSocket);

      function ChromeSocket() {
          babelHelpers.classCallCheck(this, ChromeSocket);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ChromeSocket).call(this));

          _this._onCreate = _this._onCreate.bind(_this);
          _this._onConnect = _this._onConnect.bind(_this);
          _this._onReceive = _this._onReceive.bind(_this);
          _this._onReceiveError = _this._onReceiveError.bind(_this);
          return _this;
      }

      babelHelpers.createClass(ChromeSocket, [{
          key: "connect",
          value: function connect(addr, port) {
              var _this2 = this;

              this._active();
              return chrome.sockets.tcp.create({}, function (si) {
                  _this2._onCreate(si, addr, parseInt(port));
              });
          }
      }, {
          key: "_onCreate",
          value: function _onCreate(si, addr, port) {
              var _this3 = this;

              this.socketId = si.socketId;
              if (this.socketId > 0) {
                  registerSocketConnection(si.socketId);
                  chrome.sockets.tcp.setPaused(this.socketId, true, function () {
                      chrome.sockets.tcp.connect(_this3.socketId, addr, port, _this3._onConnect);
                  });
              } else {
                  return this.emit("error", "couldn't create socket");
              }
          }
      }, {
          key: "_onConnect",
          value: function _onConnect(rc) {
              if (rc < 0) {
                  var msg = "Couldn't connect to socket: " + chrome.runtime.lastError.message + " (error " + -rc + ")";
                  return this.emit("error", msg);
              } else {
                  this.emit("connect");
                  chrome.sockets.tcp.onReceive.addListener(this._onReceive);
                  chrome.sockets.tcp.onReceiveError.addListener(this._onReceiveError);
                  chrome.sockets.tcp.setPaused(this.socketId, false);
              }
          }
      }, {
          key: "_onReceive",
          value: function _onReceive(info) {
              if (info.socketId != this.socketId) return;
              this._active();
              this.emit("data", info.data);
          }
      }, {
          key: "_onReceiveError",
          value: function _onReceiveError(info) {
              if (info.socketId != this.socketId) return;
              this._active();
              if (info.resultCode == -100) {
                  // connection closed
                  this.emit("end");
                  this.close();
              } else {
                  this.emit("error", "read from socket: error " + -info.resultCode + ")");
                  this.close();
              }
          }
      }, {
          key: "write",
          value: function write(data) {
              var _this4 = this;

              this._active();
              return chrome.sockets.tcp.send(this.socketId, data, function (sendInfo) {
                  if (sendInfo.resultCode < 0) {
                      var msg = chrome.runtime.lastError.message;
                      console.error("SOCKET ERROR on send: ", msg + " (error " + -sendInfo.resultCode + ")");
                  }
                  if (sendInfo.bytesSent === data.byteLength) {
                      return _this4.emit("drain");
                  } else {
                      if (sendInfo.bytesSent >= 0) {
                          console.error("Can't handle non-complete send: wrote " + (sendInfo.bytesSent + " expected " + data.byteLength));
                      }
                      return _this4.emit("error", "Invalid send on socket, code: " + sendInfo.bytesSent);
                  }
              });
          }
      }, {
          key: "close",
          value: function close() {
              if (this.socketId != null) {
                  chrome.sockets.tcp.onReceive.removeListener(this._onReceive);
                  chrome.sockets.tcp.onReceiveError.removeListener(this._onReceiveError);
                  chrome.sockets.tcp.disconnect(this.socketId);
                  chrome.sockets.tcp.close(this.socketId);
                  registerSocketConnection(this.socketId, true);
              }
              return this.emit("close");
          }
      }]);
      return ChromeSocket;
  }(AbstractTCPSocket);

  /**
   * Represents a connection to an IRC server.
   */

  var IRC = function (_EventEmitter) {
      babelHelpers.inherits(IRC, _EventEmitter);

      function IRC(opt_socket) {
          babelHelpers.classCallCheck(this, IRC);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(IRC).call(this));

          _this.reconnect = _this.reconnect.bind(_this);
          _this.onTimeout = _this.onTimeout.bind(_this);
          _this.util = util;
          _this.preferredNick = "circ-user-" + _this.util.randomName(5);
          _this.setSocket(opt_socket || new ChromeSocket());
          _this.data = _this.util.emptySocketData();
          _this.exponentialBackoff = 0;
          _this.partialNameLists = {};
          _this.channels = {};
          _this.serverResponseHandler = new ServerResponseHandler(_this);
          _this.state = "disconnected";
          _this.support = {};
          _this._log = getLogger(_this);
          return _this;
      }

      babelHelpers.createClass(IRC, [{
          key: "setSocket",
          value: function setSocket(socket) {
              var _this2 = this;

              delete this.socket;
              this.socket = socket;
              this.socket.on("connect", function () {
                  return _this2.onConnect();
              });
              this.socket.on("data", function (data) {
                  return _this2.onData(data);
              });
              this.socket.on("drain", function () {
                  return _this2.onDrain();
              });
              this.socket.on("error", function (err) {
                  return _this2.onError(err);
              });
              this.socket.on("end", function (err) {
                  return _this2.onEnd(err);
              });
              return this.socket.on("close", function (err) {
                  return _this2.onClose(err);
              });
          }
      }, {
          key: "setPreferredNick",
          value: function setPreferredNick(preferredNick) {
              this.preferredNick = preferredNick;
          }
          /**
           * Public
           */

      }, {
          key: "connect",
          value: function connect(server, port, password) {
              var state = this.state;
              this.server = server != null ? server : this.server;
              this.port = port != null ? port : this.port;
              this.password = password != null ? password : this.password;
              if (state !== "disconnected" && state !== "reconnecting") {
                  return;
              }
              clearTimeout(this.reconnectTimeout);
              this.socket.connect(this.server, this.port);
              return this.state = "connecting";
          }
          /**
           * Public
           */

      }, {
          key: "quit",
          value: function quit(reason) {
              if (this.state === "connected" || this.state === "disconnecting") {
                  this.send("QUIT", reason != null ? reason : this.quitReason);
                  this.state = "disconnected";
                  return this.endSocketOnDrain = true;
              } else {
                  this.quitReason = reason;
                  return this.state = "disconnecting";
              }
          }
          /**
           * Public
           */

      }, {
          key: "giveup",
          value: function giveup() {
              if (this.state !== "reconnecting") return;
              clearTimeout(this.reconnectTimeout);
              return this.state = "disconnected";
          }
      }, {
          key: "join",
          value: function join(channel, key) {
              if (this.state === "connected") {
                  if (key) {
                      return this.doCommand("JOIN", channel, key);
                  } else {
                      return this.doCommand("JOIN", channel);
                  }
              } else if (!this.channels[channel.toLowerCase()]) {
                  return this.channels[channel.toLowerCase()] = {
                      channel: channel,
                      names: [],
                      key: key
                  };
              }
          }
      }, {
          key: "part",
          value: function part(channel, opt_reason) {
              if (this.state === "connected") {
                  return this.doCommand("PART", channel, opt_reason);
              } else if (this.channels[channel.toLowerCase()]) {
                  return delete this.channels[channel.toLowerCase()];
              }
          }
          /**
           * Public
           * @param  {any} cmd
           * @param  {any} ...rest
           */

      }, {
          key: "doCommand",
          value: function doCommand() {
              return this.sendIfConnected.apply(this, arguments);
          }
      }, {
          key: "onConnect",
          value: function onConnect() {
              if (this.password) {
                  this.send("PASS", this.password);
              }
              this.send("NICK", this.preferredNick);
              this.send("USER", this.preferredNick.replace(/[^a-zA-Z0-9]/, ""), "0", "*", "Hyuu");
              return this.socket.setTimeout(60000, this.onTimeout);
          }
      }, {
          key: "onTimeout",
          value: function onTimeout() {
              if (this.state === "connected" && this.exponentialBackoff > 0) {
                  this.exponentialBackoff--;
              }
              this.send("PING", +new Date());
              return this.socket.setTimeout(60000, this.onTimeout);
          }
      }, {
          key: "onError",
          value: function onError(err) {
              this.emitMessage("socket_error", Chat.SERVER_WINDOW, err);
              this.setReconnect();
              return this.socket.close();
          }
      }, {
          key: "onClose",
          value: function onClose() {
              this.socket.setTimeout(0, this.onTimeout);
              if (this.state === "connected") {
                  this.emit("disconnect");
                  return this.setReconnect();
              }
          }
      }, {
          key: "onEnd",
          value: function onEnd() {
              console.error("remote peer closed connection");
              if (this.state === "connecting" || this.state === "connected") {
                  this.emit("disconnect");
                  return this.setReconnect();
              }
          }
      }, {
          key: "setReconnect",
          value: function setReconnect() {
              var backoff;
              this.state = "reconnecting";
              backoff = 2000 * Math.pow(2, this.exponentialBackoff);
              this.reconnectTimeout = setTimeout(this.reconnect, backoff);
              if (!(this.exponentialBackoff > 4)) {
                  return this.exponentialBackoff++;
              }
          }
      }, {
          key: "reconnect",
          value: function reconnect() {
              return this.connect();
          }
      }, {
          key: "onData",
          value: function onData(pdata) {
              var _this3 = this;

              this.data = this.util.concatSocketData(this.data, pdata);
              var dataView = new Uint8Array(this.data);
              var _results = [];
              while (dataView.length > 0) {
                  var cr = false;
                  var crlf = null;
                  for (var i = 0; i < dataView.length; ++i) {
                      var d = dataView[i];
                      if (d === 0x0d) {
                          // Even though the spec says that lines should end with CRLF some
                          // servers (e.g. irssi proxy) just send LF.
                          cr = true;
                      } else if (d === 0x0a) {
                          crlf = i;
                          break;
                      } else {
                          cr = false;
                      }
                  }
                  if (crlf !== null) {
                      var line = this.data.slice(0, cr ? crlf - 1 : crlf);
                      this.data = this.data.slice(crlf + 1);
                      dataView = new Uint8Array(this.data);
                      _results.push(this.util.fromSocketData(line, function (lineStr) {
                          _this3._log("<=", "(" + _this3.server + ")", lineStr);
                          return _this3.onServerMessage(_this3.util.parseCommand(lineStr));
                      }));
                  } else {
                      break;
                  }
              }
              return _results;
          }
      }, {
          key: "onDrain",
          value: function onDrain() {
              if (this.endSocketOnDrain) {
                  this.socket.close();
              }
              return this.endSocketOnDrain = false;
          }
      }, {
          key: "send",
          value: function send() {
              var _util,
                  _this4 = this;

              var msg = (_util = this.util).makeCommand.apply(_util, arguments);
              this._log("=>", this.server, msg.slice(0, msg.length - 2));
              return this.util.toSocketData(msg, function (arr) {
                  return _this4.socket.write(arr);
              });
          }
      }, {
          key: "sendIfConnected",
          value: function sendIfConnected() {
              if (this.state === "connected") {
                  return this.send.apply(this, arguments);
              }
          }
      }, {
          key: "onServerMessage",
          value: function onServerMessage(cmd) {
              if (/^\d{3}$/.test(cmd.command)) {
                  cmd.command = parseInt(cmd.command, 10);
              }
              if (this.serverResponseHandler.canHandle(cmd.command)) {
                  return this.handle.apply(this, [cmd.command, this.util.parsePrefix(cmd.prefix)].concat(babelHelpers.toConsumableArray(cmd.params)));
              } else {
                  return this.emitMessage("other", Chat.SERVER_WINDOW, cmd);
              }
          }

          /**
           * @param  {any[]} ...args [cmd, ...rest]
           */

      }, {
          key: "handle",
          value: function handle() {
              var _serverResponseHandle;

              return (_serverResponseHandle = this.serverResponseHandler).handle.apply(_serverResponseHandle, arguments);
          }
      }, {
          key: "emit",
          value: function emit(name, channel) {
              for (var _len = arguments.length, rest = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                  rest[_key - 2] = arguments[_key];
              }

              var event = new (Function.prototype.bind.apply(Event$1, [null].concat(["server", name], rest)))();
              event.setContext(this.server, channel);
              return this.emitCustomEvent(event);
          }
      }, {
          key: "emitMessage",
          value: function emitMessage(name, channel) {
              for (var _len2 = arguments.length, rest = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                  rest[_key2 - 2] = arguments[_key2];
              }

              var event = new (Function.prototype.bind.apply(Event$1, [null].concat(["message", name], rest)))();
              event.setContext(this.server, channel);
              return this.emitCustomMessage(event);
          }
      }, {
          key: "emitCustomMessage",
          value: function emitCustomMessage(event) {
              return this.emitCustomEvent(event);
          }
      }, {
          key: "emitCustomEvent",
          value: function emitCustomEvent(event) {
              return babelHelpers.get(Object.getPrototypeOf(IRC.prototype), "emit", this).call(this, event.type, event);
          }
      }, {
          key: "isOwnNick",
          value: function isOwnNick(nick) {
              return nicksEqual(this.nick, nick);
          }
      }, {
          key: "isValidChannelPrefix",
          value: function isValidChannelPrefix(channel) {
              var prefixes = this.support["chantypes"] || "#&";
              return prefixes.indexOf(channel.substr(0, 1)) != -1;
          }
      }]);
      return IRC;
  }(EventEmitter);

  window.ArrayBuffer.prototype.slice = window.ArrayBuffer.prototype.slice || window.ArrayBuffer.prototype.webkitSlice || function () {
      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
      }

      var src = Uint8Array.prototype.subarray.apply(new Uint8Array(this), args);
      var dst = new Uint8Array(src.length);
      dst.set(src);
      return dst.buffer;
  };

  /**
   * Represents a user command, like /kick or /say.
   */

  var UserCommand = function () {
      function UserCommand(name, description) {
          babelHelpers.classCallCheck(this, UserCommand);

          this.description = description;
          this.name = name;
          this.describe(this.description);
          this._hasValidArgs = false;
      }
      /**
       * Describe the command using the following format:
       * * description - a description of what the command does; used with /help <command>
       * * category - what category the command falls under. This is used with /help
       * * params - what parameters the command takes, 'opt_<name>' for optional, '<name>...' for variable
       *
       * * validateArgs - returns a truthy variable if the given arguments are valid.
       * * requires - what the command requires to run (e.g. a connections to an IRC server)
       * * usage - manually set a usage message, one will be generated if not specified
       * * run - the function to call when the command is run
       */


      babelHelpers.createClass(UserCommand, [{
          key: "describe",
          value: function describe(description) {
              var _ref1;
              if (this._description == null) {
                  this._description = description.description;
              }
              if (this._params == null) {
                  this._params = description.params;
              }
              if (this._requires == null) {
                  this._requires = description.requires;
              }
              if (this._validateArgs == null) {
                  this._validateArgs = description.validateArgs;
              }
              if (this._usage == null) {
                  this._usage = description.usage;
              }
              if (this.run == null) {
                  this.run = description.run;
              }
              return (_ref1 = this.category) != null ? _ref1 : this.category = description.category;
          }
          /**
           * Try running the command. A command can fail to run if its requirements
           *  aren't met (e.g. needs a connection to the internet) or the specified
           *  arguments are invalid. In these cases a help message is displayed.
           * @param {Context} context Which server/channel the command came from.
           * @param {Object...} args Arguments for the command.
           */

      }, {
          key: "tryToRun",
          value: function tryToRun(context) {
              this.setContext(context);
              if (!this.canRun()) {
                  if (this.shouldDisplayFailedToRunMessage()) {
                      this.displayHelp();
                  }
                  return;
              }

              for (var _len2 = arguments.length, rest = Array(_len2 > 1 ? _len2 - 1 : 0), _key = 1; _key < _len2; _key++) {
                  rest[_key - 1] = arguments[_key];
              }

              this.setArgs.apply(this, rest);
              if (this._hasValidArgs) {
                  return this.run();
              } else {
                  return this.displayHelp();
              }
          }
      }, {
          key: "setChat",
          value: function setChat(chat) {
              this.chat = chat;
          }
      }, {
          key: "setContext",
          value: function setContext(context) {
              this.win = this.chat.determineWindow(context);
              if (this.win !== Chat.NO_WINDOW) {
                  this.conn = this.win.conn;
                  return this.chan = this.win.target;
              }
          }
      }, {
          key: "setArgs",
          value: function setArgs() {
              for (var _len3 = arguments.length, args = Array(_len3), _key2 = 0; _key2 < _len3; _key2++) {
                  args[_key2] = arguments[_key2];
              }

              return this._hasValidArgs = this._tryToAssignArgs(args) && (!this._validateArgs || !!this._validateArgs());
          }
      }, {
          key: "_tryToAssignArgs",
          value: function _tryToAssignArgs(args) {
              var _this = this;

              var params;
              this.args = [];
              this._removeTrailingWhiteSpace(args);

              if (!this._params) return args.length === 0;

              this._resetParams();
              this._truncateVariableArgs(args);
              params = this._truncateExtraOptionalParams(args.length);

              if (args.length !== params.length) return false;

              params.forEach(function (param, i) {
                  return _this[_this._getParamName(param)] = args[i];
              });

              this.args = args;
              return true;
          }
      }, {
          key: "_resetParams",
          value: function _resetParams() {
              var param, _i, _len, _ref1, _results;
              _ref1 = this._params;
              _results = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                  param = _ref1[_i];
                  _results.push(this[this._getParamName(param)] = void 0);
              }
              return _results;
          }
          /**
           * Remove empty strings from end of the array
           * @param  {string[]} args
           */

      }, {
          key: "_removeTrailingWhiteSpace",
          value: function _removeTrailingWhiteSpace(args) {
              while (args[args.length - 1] === "") {
                  args.pop();
              }
              return args;
          }

          /**
           * Join all arguments that fit under the variable argument param.
           * Note: only the last argument is allowd to be variable.
           */

      }, {
          key: "_truncateVariableArgs",
          value: function _truncateVariableArgs(args) {
              var _ref1;
              if (args.length < this._params.length) {
                  return args;
              }
              if (this._isVariable(this._params[this._params.length - 1])) {
                  args[this._params.length - 1] = (_ref1 = args.slice(this._params.length - 1)) != null ? _ref1.join(" ") : void 0;
                  return args.length = this._params.length;
              }
          }
      }, {
          key: "_truncateExtraOptionalParams",
          value: function _truncateExtraOptionalParams(numArgs) {
              var i,
                  param,
                  params,
                  _i,
                  _ref1,
                  extraParams = this._params.length - numArgs;
              if (extraParams <= 0) {
                  return this._params;
              }
              params = [];
              for (i = _i = _ref1 = this._params.length - 1; _ref1 <= 0 ? _i <= 0 : _i >= 0; i = _ref1 <= 0 ? ++_i : --_i) {
                  param = this._params[i];
                  if (extraParams > 0 && this._isOptional(param)) {
                      extraParams--;
                  } else {
                      params.splice(0, 0, param);
                  }
              }
              return params;
          }

          /**
           * When a command can't run, determine if a helpful message should be
           *  displayed to the user.
           */

      }, {
          key: "shouldDisplayFailedToRunMessage",
          value: function shouldDisplayFailedToRunMessage() {
              if (this.win === Chat.NO_WINDOW) {
                  return false;
              }
              return this.name !== "say";
          }

          /**
           * Commands can only run if their requirements are met (e.g. connected to the
           *  internet, in a channel, etc) and a run method is defined.
           */

      }, {
          key: "canRun",
          value: function canRun(opt_context) {
              var _this2 = this;

              if (opt_context) {
                  this.setContext(opt_context);
              }
              if (!this.run) {
                  return false;
              }
              if (!this._requires) {
                  return true;
              }

              // return false if some requirements are not met, else return true
              return !this._requires.some(function (requirement) {
                  return !_this2._meetsRequirement(requirement);
              });
          }
      }, {
          key: "_meetsRequirement",
          value: function _meetsRequirement(requirement) {
              switch (requirement) {
                  case "online":
                      return isOnline();
                  case "connection":
                      return !!this.conn && isOnline();
                  case "channel":
                      return !!this.chan;
                  default:
                      return getFieldOrNull(this, ["conn", "irc", "state"]) === requirement;
              }
          }
      }, {
          key: "displayHelp",
          value: function displayHelp(win) {
              if (win == null) {
                  win = this.win;
              }
              return win.message("", escape(this.getHelp()), "notice help");
          }
      }, {
          key: "getHelp",
          value: function getHelp() {
              var usageText,
                  _ref1,
                  descriptionText = this._description ? ", " + this._description : "";
              if (this._usage) {
                  usageText = "" + this._usage;
              }
              if (usageText == null) {
                  usageText = ((_ref1 = this._params) != null ? _ref1.length : void 0) > 0 ? this._getUsage() : "";
              }
              return this.name.toUpperCase() + " " + usageText + descriptionText + ".";
          }
      }, {
          key: "_getUsage",
          value: function _getUsage() {
              var _this3 = this;

              return this._params.map(function (param) {
                  var paramName = _this3._getParamName(param);
                  return _this3._isOptional(param) ? "[" + paramName + "]" : "<" + paramName + ">";
              }).join(" ");
          }
      }, {
          key: "_getParamName",
          value: function _getParamName(param) {
              if (this._isOptional(param)) {
                  param = param.slice(4);
              }
              if (this._isVariable(param)) {
                  param = param.slice(0, +(param.length - 4) + 1 || 9e9);
              }
              return param;
          }
      }, {
          key: "_isOptional",
          value: function _isOptional(param) {
              return param.indexOf("opt_") === 0;
          }
      }, {
          key: "_isVariable",
          value: function _isVariable(param) {
              return (param != null ? param.slice(param.length - 3) : void 0) === "...";
          }
      }, {
          key: "isOwnNick",
          value: function isOwnNick(nick) {
              var _ref1;
              if (nick == null) {
                  nick = this.nick;
              }
              return nicksEqual((_ref1 = this.conn) != null ? _ref1.irc.nick : void 0, nick);
          }
      }, {
          key: "displayDirectMessage",
          value: function displayDirectMessage(nick, message) {
              var _ref1;
              if (nick == null) {
                  nick = this.nick;
              }
              if (message == null) {
                  message = this.message;
              }
              if (((_ref1 = this.conn) != null ? _ref1.windows[nick] : void 0) != null) {
                  return this._displayDirectMessageInPrivateChannel(nick, message);
              } else {
                  return this._displayDirectMessageInline(nick, message);
              }
          }

          /**
           * Used with /msg. Displays the message in a private channel.
           */

      }, {
          key: "_displayDirectMessageInPrivateChannel",
          value: function _displayDirectMessageInPrivateChannel(nick, message) {
              var context;
              context = {
                  server: this.conn.name,
                  channel: nick
              };
              return this.chat.displayMessage("privmsg", context, this.conn.irc.nick, message);
          }

          /**
           * Used with /msg. Displays the private message in the current window.
           * Direct messages always display inline until the user receives a response.
           */

      }, {
          key: "_displayDirectMessageInline",
          value: function _displayDirectMessageInline(nick, message) {
              return this.displayMessageWithStyle("privmsg", nick, message, "direct");
          }
      }, {
          key: "displayMessage",
          value: function displayMessage() {
              var _chat;

              for (var _len4 = arguments.length, args = Array(_len4), _key3 = 0; _key3 < _len4; _key3++) {
                  args[_key3] = arguments[_key3];
              }

              var type = args[0],
                  rest = 2 <= args.length ? args.slice(1) : [],
                  context = {
                  server: getFieldOrNull(this, ["conn", "name"]),
                  channel: this.chan
              };
              return (_chat = this.chat).displayMessage.apply(_chat, [type, context].concat(babelHelpers.toConsumableArray(rest)));
          }

          /**
           * Displays a message with a custom style. This is useful for indicating that
           *  a message be rendered in a special way (e.g. no pretty formatting).
           */

      }, {
          key: "displayMessageWithStyle",
          value: function displayMessageWithStyle() {
              for (var _len5 = arguments.length, args = Array(_len5), _key4 = 0; _key4 < _len5; _key4++) {
                  args[_key4] = arguments[_key4];
              }

              var i,
                  type = args[0],
                  rest = 3 <= args.length ? args.slice(1, i = args.length - 1) : (i = 1, []),
                  style = args[i++],
                  e = new (Function.prototype.bind.apply(Event$1, [null].concat(["message", type], babelHelpers.toConsumableArray(rest))))();
              e.setContext(getFieldOrNull(this, ["conn", "name"]), this.chan);
              e.addStyle(style);
              return this.chat.emit(e.type, e);
          }
      }, {
          key: "handleCTCPRequest",
          value: function handleCTCPRequest(nick, type) {
              var delimiter = CTCPHandler.DELIMITER,
                  message = delimiter + type + delimiter;
              this.displayDirectMessage(nick, "CTCP " + type);
              return this.conn.irc.doCommand("PRIVMSG", nick, message);
          }

          /**
           * Used to set the arguments for MODE shortcut commands.
           * @param {string} type E.g. /op, /voice, etc.
           */

      }, {
          key: "setModeArgs",
          value: function setModeArgs(type) {
              this.nicks = [this.nick];
              this.target = this.chan;
              return this.mode = type;
          }

          /**
           * Determine if the given string is a valid mode expression.
           * TODO: This can be improved. (e.g. ++ and +a++ shouldn't be valid)
           * @param {string} mode E.g. +o, -o, +v, etc.
           */

      }, {
          key: "isValidMode",
          value: function isValidMode(mode) {
              var _ref1;
              return (_ref1 = mode != null ? mode[0] : void 0) === "+" || _ref1 === "-";
          }
      }, {
          key: "listInstalledScripts",
          value: function listInstalledScripts() {
              var names = this.chat.scriptHandler.getScriptNames();
              if (names.isEmpty()) {
                  return "No scripts are currently installed";
              } else {
                  return "Installed scripts: " + getReadableList(names);
              }
          }
      }]);
      return UserCommand;
  }();

  /**
   * Parses raw commands from the user. Used with the /raw command.
   */

  var CustomCommandParser = function () {
      function CustomCommandParser() {
          babelHelpers.classCallCheck(this, CustomCommandParser);
      }

      babelHelpers.createClass(CustomCommandParser, [{
          key: "parse",
          value: function parse() {
              for (var _len2 = arguments.length, args = Array(_len2), _key = 0; _key < _len2; _key++) {
                  args[_key] = arguments[_key];
              }

              var params,
                  channel = args[0],
                  rest = 2 <= args.length ? args.slice(1) : [];
              if (rest[1] === "-c") {
                  params = this._mergeQuotedWords(rest.slice(2));
                  return [rest[0].toUpperCase(), channel].concat(babelHelpers.toConsumableArray(params));
              } else {
                  params = this._mergeQuotedWords(rest.slice(1));
                  return [rest[0].toUpperCase()].concat(babelHelpers.toConsumableArray(params));
              }
          }
      }, {
          key: "_mergeQuotedWords",
          value: function _mergeQuotedWords(words) {
              var i,
                  word,
                  _i,
                  _len,
                  start = -1;

              for (i = _i = 0, _len = words.length; _i < _len; i = ++_i) {
                  word = words[i];
                  if (word[0] === "\"" && start === -1) {
                      start = i;
                  }
                  if (word[word.length - 1] === "\"" && start !== -1) {
                      words.splice(start, i - start + 1, words.slice(start, +i + 1 || 9e9).join(" "));
                      words[start] = this._trimQuotes(words[start]);
                      return this._mergeQuotedWords(words);
                  }
              }
              return words;
          }
      }, {
          key: "_trimQuotes",
          value: function _trimQuotes(word) {
              return word.slice(1, +(word.length - 2) + 1 || 9e9);
          }
      }]);
      return CustomCommandParser;
  }();

  var customCommandParser = new CustomCommandParser();

  var Script = function () {
      function Script(sourceCode, frame) {
          babelHelpers.classCallCheck(this, Script);

          this.sourceCode = sourceCode;
          this.frame = frame;
          this.id = Script.getUniqueID();
          this._messagesToHandle = [];
          this._name = "script" + (this.id + 1);
      }

      babelHelpers.createClass(Script, [{
          key: "postMessage",
          value: function postMessage(msg) {
              return this.frame.postMessage(msg, "*");
          }
      }, {
          key: "shouldHandle",
          value: function shouldHandle(event) {
              return this._messagesToHandle.indexOf(event.hook) >= 0;
          }

          /**
           * Begin handling events of the given type and name.
           * @param {string} type The event type (command, message or server)
           * @param {string} name The name of the event (e.g. kick, NICK, privmsg, etc)
           */

      }, {
          key: "beginHandlingType",
          value: function beginHandlingType(type, name) {
              return this._messagesToHandle.push(type + " " + name);
          }
      }, {
          key: "setName",
          value: function setName(_name) {
              this._name = _name;
          }
      }, {
          key: "getName",
          value: function getName() {
              return this._name;
          }
      }]);
      return Script;
  }();

  Script.getScriptFromFrame = function (scripts, frame) {
      return iter(scripts).values().find(function (script) {
          return script.frame === frame;
      });
  };

  Script.scriptCount = 0;

  Script.getUniqueID = function () {
      return this.scriptCount++;
  };

  /*
   * ** Auto-generated by src/script/prepackaged/prepackaged_scripts.py **
   *
   * To modify this file:
   *   * create or edit a script (must be a .js file)
   *   * put script in src/script/prepackaged/
   *   * run 'make package-scripts'
   *
   * Maintains a list of the source code from scripts that come packaged with CIRC.
  */
  var prepackagedScripts = ["  "];

  var ScriptLoader = function () {
      function ScriptLoader() {
          babelHelpers.classCallCheck(this, ScriptLoader);

          this._sendSourceCode = this._sendSourceCode.bind(this);
          this._scripts = {};
          addEventListener("message", this._sendSourceCode);
      }

      babelHelpers.createClass(ScriptLoader, [{
          key: "_sendSourceCode",
          value: function _sendSourceCode(e) {
              var script = Script.getScriptFromFrame(this._scripts, e.source);
              if (script && e.data.type === "onload") {
                  script.postMessage({
                      type: "source_code",
                      sourceCode: script.sourceCode
                  });
                  return delete this._scripts[script.id];
              }
          }
      }, {
          key: "loadPrepackagedScripts",
          value: function loadPrepackagedScripts(callback) {
              var _this = this;

              return prepackagedScripts.map(function (sourceCode) {
                  return callback(_this._createScript(sourceCode));
              });
          }
      }, {
          key: "loadScriptsFromStorage",
          value: function loadScriptsFromStorage(scripts, callback) {
              var _this2 = this;

              return scripts.map(function (script) {
                  return callback(_this2._createScript(script.sourceCode));
              });
          }
      }, {
          key: "createScriptFromFileSystem",
          value: function createScriptFromFileSystem(callback) {
              var _this3 = this;

              /*eslint no-console: 0 */
              return loadFromFileSystem(function (sourceCode) {
                  try {
                      return callback(_this3._createScript(sourceCode));
                  } catch (error) {
                      return console.error("failed to eval:", error.toString());
                  }
              });
          }

          /**
           * @param {string} sourceCode The raw JavaScript source code of the script.
           * @return {Script} Returns a handle to the script.
           */

      }, {
          key: "_createScript",
          value: function _createScript(sourceCode) {
              var frame = this._createIframe(),
                  script = new Script(sourceCode, frame);
              this._scripts[script.id] = script;
              return script;
          }
      }, {
          key: "_createIframe",
          value: function _createIframe() {
              var iframe;
              iframe = document.createElement("iframe");
              iframe.src = "plugenv/script_frame.html";
              iframe.style.display = "none";
              document.body.appendChild(iframe);
              return iframe.contentWindow;
          }

          /**
           * Removes the iFrame in which the script is running from the DOM.
           * @param {Script} script
           */

      }, {
          key: "unloadScript",
          value: function unloadScript(script) {
              document.body.removeChild(script.frame);
              return delete script.frame;
          }
      }]);
      return ScriptLoader;
  }();

  var ScriptLoader$1 = new ScriptLoader();

  /**
   * Determine API support
   */
  function listenSupported() {
      return chrome.sockets && chrome.sockets.tcpServer;
  }

  function clientSocketSupported() {
      return chrome.sockets && chrome.sockets.tcp;
  }

  function getNetworkInterfacesSupported() {
      return chrome.system && chrome.system.network;
  }

  function errorHandler(e) {
      console.error("[Error]", e);
  }

  var userCommandList = {
      "nick": {
          description: "sets your nick",
          category: "common",
          params: ["nick"],
          run: function run() {
              var _ref1;
              return this.chat.setNick((_ref1 = this.conn) != null ? _ref1.name : void 0, this.nick);
          }
      },
      "server": {
          description: "connects to the server, port 6667 is used by default, reconnects to the current server if no server is specified, use '+' to enable SSL (i.e. +6667)",
          category: "common",
          params: ["opt_server", "opt_port", "opt_password"],
          requires: ["online"],
          validateArgs: function validateArgs() {
              if (!this.port) this.port = 6667;
              if (this.server == null) {
                  this.server = getFieldOrNull(this.conn, ["name"]);
              }
              return this.server && !isNaN(this.port);
          },
          run: function run() {
              return this.chat.connect(this.server, this.port, this.password);
          }
      },
      "join": {
          description: "joins the channel with the key if provided, reconnects to the current channel if no channel is specified",
          category: "common",
          params: ["opt_channel", "opt_key"],
          requires: ["connection"],
          validateArgs: function validateArgs() {
              if (this.channel == null) {
                  this.channel = this.chan;
              }
              this.channel = this.channel.toLowerCase();
              return true;
          },
          run: function run() {
              return this.chat.join(this.conn, this.channel, this.key);
          }
      },
      "part": {
          description: "closes the current window and disconnects from the channel",
          category: "common",
          params: ["opt_reason..."],
          requires: ["connection", "channel"],
          run: function run() {
              this.chat.disconnectAndRemoveRoom(this.conn.name, this.chan, this.reason);
          }
      },
      "leave": {
          "extends": "part"
      },
      "close": {
          "extends": "part"
      },
      "invite": {
          description: "invites the specified nick to the current or specified channel",
          category: "common",
          params: ["nick...", "opt_channel"],
          requires: ["connection"],
          usage: "<nick> [channel]",
          run: function run() {
              if (!this.channel) {
                  if (this.chan) {
                      this.channel = this.chan;
                  } else {
                      return this.displayMessage("error", "you must be in a channel or specify one");
                  }
              }
              if (!this.conn.irc.channels[this.channel]) {
                  /*
                  * According to spec you can invite users to a channel that you are
                  *  not a member of if it doesn"t exist
                  */
                  return this.displayMessage("error", "you must be in " + this.channel + " to invite someone to it");
              }
              this.displayMessage("notice", "inviting " + this.nick + " to join " + this.channel);
              return this.conn.irc.doCommand("INVITE", this.nick, this.channel);
          }
      },
      "win": {
          description: "switches windows, only channel windows are selected this way",
          category: "misc",
          params: ["windowNum"],
          validateArgs: function validateArgs() {
              this.windowNum = parseInt(this.windowNum);
              return !isNaN(this.windowNum);
          },
          run: function run() {
              return this.chat.switchToChannelByIndex(this.windowNum - 1);
          }
      },
      "debug": {
          description: "prints the last 300-400 logs to the developer console and enables future logging of info and warning messages",
          category: "misc",
          run: function run() {
              enableLogging();
              this.displayMessage("notice", "logging enabled. See developer " + "console for previous logs. Have a bug to report? File an " + "issue at " + ISSUES_URL);
          }
      },
      "say": {
          description: "sends text to the current channel",
          category: "uncommon",
          params: ["text..."],
          requires: ["connection", "channel", "connected"],
          run: function run() {
              this.conn.irc.doCommand("PRIVMSG", this.chan, this.text);
              return this.displayMessage("privmsg", this.conn.irc.nick, this.text);
          }
      },
      "list": {
          description: "lists all channels on the server.",
          category: "uncommon",
          params: ["opt_channels"],
          requires: ["connection"],
          run: function run() {
              return this.conn.irc.doCommand("LIST", this.channels);
          }
      },
      "me": {
          description: "sends text to the current channel, spoken in the 3rd person",
          category: "uncommon",
          "extends": "say",
          validateArgs: function validateArgs() {
              return this.text = "\u0001ACTION " + this.text + "\u0001";
          }
      },
      "quit": {
          description: "disconnects from the current server",
          category: "common",
          params: ["opt_reason..."],
          requires: ["connection"],
          run: function run() {
              this.chat.disconnectAndRemoveRoom(this.conn.name, null /* channel */, this.reason);
          }
      },
      "names": {
          description: "lists nicks in the current channel",
          category: "uncommon",
          requires: ["connection", "channel", "connected"],
          run: function run() {
              var msg, names;
              if (this.win.isPrivate()) {
                  msg = "You're in a private conversation with " + this.chan + ".";
              } else {
                  names = iter(this.conn.irc.channels[this.chan].names).values().sort().toArray();
                  msg = "Users in " + this.chan + ": " + JSON.stringify(names);
              }
              return this.win.message("", msg, "notice names");
          }
      },
      "clear": {
          description: "clears messages in the current window or from all windows if all is passed",
          category: "uncommon",
          params: ["opt_all"],
          validateArgs: function validateArgs() {
              if (!this.all || this.all === "all") {
                  return true;
              }
          },
          run: function run() {
              var _this = this;

              if (this.all === "all") {
                  var _ret = function () {
                      var winList = _this.chat.winList;
                      return {
                          v: winList.map(function (_, i) {
                              return winList.get(i).clear();
                          })
                      };
                  }();

                  if ((typeof _ret === "undefined" ? "undefined" : babelHelpers.typeof(_ret)) === "object") return _ret.v;
              } else {
                  return this.win.clear();
              }
          }
      },
      "help": {
          description: "displays information about a command, lists all commands if no command is specified",
          category: "misc",
          params: ["opt_command"],
          run: function run() {
              var commands;
              this.command = this.chat.userCommands.getCommand(this.command);
              if (this.command) {
                  return this.command.displayHelp(this.win);
              } else {
                  commands = this.chat.userCommands.getCommands();
                  return this.win.messageRenderer.displayHelp(commands);
              }
          }
      },
      "hotkeys": {
          description: "lists keyboard shortcuts",
          category: "misc",
          run: function run() {
              return this.win.messageRenderer.displayHotkeys(this.chat.getKeyboardShortcuts().getMap());
          }
      },
      "raw": {
          description: "sends a raw event to the IRC server, use the -c flag to make the command apply to the current channel",
          category: "uncommon",
          params: ["command", "opt_arguments..."],
          usage: "<command> [-c] [arguments...]",
          requires: ["connection"],
          validateArgs: function validateArgs() {
              return this["arguments"] = this["arguments"] ? this["arguments"].split(" ") : [];
          },
          run: function run() {
              var _conn$irc;

              var command = customCommandParser.parse.apply(customCommandParser, [this.chan, this.command].concat(babelHelpers.toConsumableArray(this["arguments"])));
              return (_conn$irc = this.conn.irc).send.apply(_conn$irc, babelHelpers.toConsumableArray(command));
          }
      },
      "quote": {
          "extends": "raw"
      },
      "install": {
          description: "loads a script by opening a file browser dialog",
          category: "scripts",
          run: function run() {
              var _this2 = this;

              return ScriptLoader$1.createScriptFromFileSystem(function (script) {
                  return _this2.chat.addScript(script);
              });
          }
      },
      "uninstall": {
          description: "uninstalls a script, currently installed scripts can be listed with /scripts",
          params: ["scriptName"],
          usage: "<script name>",
          category: "scripts",
          run: function run() {
              var message, script;
              script = this.chat.scriptHandler.getScriptByName(this.scriptName);
              if (script) {
                  this.chat.storage.clearScriptStorage(this.scriptName);
                  this.chat.scriptHandler.removeScript(script);
                  this.chat.storage.scriptRemoved(script);
                  return this.displayMessage("notice", "Script " + this.scriptName + " was successfully uninstalled");
              } else {
                  message = "No script by the name '" + this.scriptName + "' was found. " + this.listInstalledScripts();
                  return this.displayMessage("error", message);
              }
          }
      },
      "scripts": {
          description: "displays a list of installed scripts",
          category: "scripts",
          run: function run() {
              return this.displayMessage("notice", this.listInstalledScripts());
          }
      },
      "topic": {
          description: "sets the topic of the current channel, displays the current topic if no topic is specified",
          category: "uncommon",
          params: ["opt_topic..."],
          requires: ["connection", "channel"],
          run: function run() {
              return this.conn.irc.doCommand("TOPIC", this.chan, this.topic);
          }
      },
      "kick": {
          description: "removes a user from the current channel",
          category: "uncommon",
          params: ["nick", "opt_reason..."],
          requires: ["connection", "channel"],
          run: function run() {
              return this.conn.irc.doCommand("KICK", this.chan, this.nick, this.reason);
          }
      },
      "mode": {
          /*
          * TODO when used with no args, display current modes
          */
          description: "sets or gets the modes of a channel or user(s), the current channel is used by default",
          category: "uncommon",
          params: ["opt_target", "opt_mode", "opt_nicks..."],
          usage: "< [channel|nick] | [channel] <mode> [nick1] [nick2] ...>",
          requires: ["connection"],
          validateArgs: function validateArgs() {
              var _ref1, _ref2;
              if (this.args.length === 0) return true;
              this.nicks = (_ref1 = (_ref2 = this.nicks) != null ? _ref2.split(" ") : void 0) != null ? _ref1 : [];
              if (this.args.length === 1 && !this.isValidMode(this.target)) {
                  return true;
              }
              if (this.isValidMode(this.target) && this.target !== this.chan) {
                  /*
                  * A target wasn't specified, shift variables over by one
                  */
                  this.nicks.push(this.mode);
                  this.mode = this.target;
                  this.target = this.chan;
              }
              return this.target && this.isValidMode(this.mode);
          },
          run: function run() {
              if (this.args.length === 0) {
                  if (this.chan) {
                      this.conn.irc.doCommand("MODE", this.chan);
                  }
                  return this.conn.irc.doCommand("MODE", this.conn.irc.nick);
              } else {
                  var _conn$irc2;

                  return (_conn$irc2 = this.conn.irc).doCommand.apply(_conn$irc2, ["MODE", this.target, this.mode].concat(babelHelpers.toConsumableArray(this.nicks)));
              }
          }
      },
      "op": {
          description: "gives operator status",
          params: ["nick"],
          "extends": "mode",
          usage: "<nick>",
          requires: ["connection", "channel"],
          validateArgs: function validateArgs() {
              return this.setModeArgs("+o");
          }
      },
      "deop": {
          description: "removes operator status",
          params: ["nick"],
          "extends": "mode",
          usage: "<nick>",
          requires: ["connection", "channel"],
          validateArgs: function validateArgs() {
              return this.setModeArgs("-o");
          }
      },
      "voice": {
          description: "gives voice",
          params: ["nick"],
          "extends": "mode",
          usage: "<nick>",
          requires: ["connection", "channel"],
          validateArgs: function validateArgs() {
              return this.setModeArgs("+v");
          }
      },
      "devoice": {
          description: "removes voice",
          params: ["nick"],
          "extends": "mode",
          usage: "<nick>",
          requires: ["connection", "channel"],
          validateArgs: function validateArgs() {
              return this.setModeArgs("-v");
          }
      },
      "away": {
          description: "sets your status to away, a response is automatically sent when people /msg or WHOIS you",
          category: "uncommon",
          params: ["opt_response..."],
          requires: ["connection"],
          validateArgs: function validateArgs() {
              if (!stringHasContent(this.response)) {
                  this.response = "I'm currently away from my computer";
              }
              return true;
          },
          run: function run() {
              return this.conn.irc.doCommand("AWAY", this.response);
          }
      },
      "back": {
          description: "sets your status to no longer being away",
          category: "uncommon",
          requires: ["connection"],
          run: function run() {
              return this.conn.irc.doCommand("AWAY", this.response);
          }
      },
      "msg": {
          description: "sends a private message",
          category: "common",
          params: ["nick", "message..."],
          requires: ["connection"],
          run: function run() {
              this.conn.irc.doCommand("PRIVMSG", this.nick, this.message);
              return this.displayDirectMessage();
          }
      },
      "whois": {
          description: "displays information about a nick",
          category: "uncommon",
          params: ["opt_nick"],
          requires: ["connection"],
          run: function run() {
              return this.conn.irc.doCommand("WHOIS", this.nick);
          }
      },
      "swhois": {
          description: "displays detailed information about a nick (by querying user's connecting server)",
          category: "uncommon",
          params: ["opt_nick"],
          requires: ["connection"],
          run: function run() {
              // Same as WHOIS, but send the nick twice.
              return this.conn.irc.doCommand("WHOIS", this.nick, this.nick);
          }
      },
      "whowas": {
          description: "displays recent login information about a nick",
          category: "uncommon",
          params: ["opt_nick"],
          requires: ["connection"],
          run: function run() {
              return this.conn.irc.doCommand("WHOWAS", this.nick);
          }
      },
      "who": {
          description: "displays detailed user list to server window; add 'o' as second option to restrict to IRCOps",
          category: "uncommon",
          params: ["channel_or_pattern", "opt_o"],
          requires: ["connection"],
          run: function run() {
              return this.conn.irc.doCommand("WHO", this.channel_or_pattern, this.o);
          }
      },
      "about": {
          description: "displays information about this IRC client",
          category: "misc",
          run: function run() {
              return this.win.messageRenderer.displayAbout();
          }
      },
      "join-server": {
          description: "use the IRC connection of another device, allowing you to be logged in with the same nick on multiple devices. Connects to the device that called /make-server if no arguments are given",
          category: "one_identity",
          requires: ["online"],
          params: ["opt_addr", "opt_port"],
          validateArgs: function validateArgs() {
              var connectInfo, parsedPort;
              parsedPort = parseInt(this.port);
              if ((this.port || this.addr) && !(parsedPort || this.addr)) {
                  return false;
              }
              connectInfo = this.chat.storage.serverDevice;
              this.port = parsedPort || (connectInfo != null ? connectInfo.port : void 0);
              if (this.addr == null) {
                  this.addr = connectInfo != null ? connectInfo.addr : void 0;
              }
              return true;
          },
          run: function run() {
              if (this.port && this.addr) {
                  if (this.addr === this.chat.remoteConnection.getConnectionInfo().addr) {
                      return this.displayMessage("error", "this device is the server and cannot connect to itself. Call /join-server on other devices to have them connect to this device or call /make-server on another device to make it the server");
                  } else {
                      this.chat.remoteConnectionHandler.isManuallyConnecting();
                      return this.chat.remoteConnection.connectToServer({
                          port: this.port,
                          addr: this.addr
                      });
                  }
              } else {
                  return this.displayMessage("error", "No server exists. Use /make-server on the device you wish to become the server.");
              }
          }
      },
      "make-server": {
          description: "makes this device a server to which other devices can connect. Connected devices use the IRC connection of this device",
          category: "one_identity",
          requires: ["online"],
          run: function run() {
              var _this3 = this;

              var state = this.chat.remoteConnection.getState();
              if (this.chat.remoteConnectionHandler.shouldBeServerDevice()) {
                  return this.displayMessage("error", "this device is already acting as a server");
              } else if (!listenSupported()) {
                  return this.displayMessage("error", "this command cannot be used with your current version of Chrome because it does not support chrome.sockets.tcpServer");
              } else if (state === "no_addr") {
                  return this.displayMessage("error", "this device can not be used as a server at this time because it cannot find its own IP address");
              } else if (state === "no_port") {
                  return this.displayMessage("error", "this device can not be used as a server at this time because no valid port was found");
              } else if (state === "finding_port") {
                  return this.chat.remoteConnection.waitForPort(function () {
                      return _this3.run;
                  });
              } else {
                  this.chat.storage.becomeServerDevice(this.chat.remoteConnection.getConnectionInfo());
                  return this.chat.remoteConnectionHandler.determineConnection();
              }
          }
      },
      "network-info": {
          description: "displays network information including port, ip address and remote connection status",
          category: "one_identity",
          run: function run() {
              var _this4 = this;

              var connectionInfo;
              this.displayMessage("breakgroup");
              if (this.chat.remoteConnection.isServer()) {
                  var numClients = this.chat.remoteConnection.devices.length;
                  if (numClients > 0) {
                      this.displayMessage("notice", "acting as a server for " + numClients + " other " + pluralize("device", numClients));
                  } else {
                      this.displayMessage("notice", "Acting as a server device. No clients have connected.");
                  }
              } else if (this.chat.remoteConnection.isClient()) {
                  var serverDevice = this.chat.remoteConnection.serverDevice;
                  this.displayMessage("notice", "connected to server device " + serverDevice.addr + " on port " + serverDevice.port);
              } else {
                  this.displayMessage("notice", "not connected to any other devices");
              }
              if (this.chat.remoteConnection.getConnectionInfo().getState() !== "found_port") return;
              this.displayMessage("breakgroup");
              connectionInfo = this.chat.remoteConnection.getConnectionInfo();
              this.displayMessageWithStyle("notice", "Port: " + connectionInfo.port, "no-pretty-format");
              this.displayMessage("breakgroup");
              this.displayMessage("notice", "IP addresses:");

              return connectionInfo.possibleAddrs.map(function (addr) {
                  return _this4.displayMessageWithStyle("notice", "    " + addr, "no-pretty-format");
              });
          }
      },
      "stop-server": {
          description: "stops connecting through another device's IRC connection and starts using a new IRC connection (see /join-server)",
          category: "one_identity",
          requires: ["online"],
          run: function run() {
              this.chat.remoteConnectionHandler.useOwnConnection();
              this.displayMessage("notice", "this device is now using its own IRC connection");
          }
      },
      "autostart": {
          description: "sets whether the application will run on startup, toggles if no arguments are given",
          category: "misc",
          usage: "[ON|OFF]",
          params: ["opt_state"],
          validateArgs: function validateArgs() {
              if (!this.state) {
                  this.enabled = void 0;
                  return true;
              }
              this.state = this.state.toLowerCase();
              if (!(this.state === "on" || this.state === "off")) {
                  return false;
              }
              this.enabled = this.state === "on";
              return true;
          },
          run: function run() {
              var willAutostart;
              willAutostart = this.chat.storage.setAutostart(this.enabled);
              if (willAutostart) {
                  return this.displayMessage("notice", "CIRC will now automatically run on startup");
              } else {
                  return this.displayMessage("notice", "CIRC will no longer automatically run on startup");
              }
          }
      },
      "query": {
          description: "opens a new window for a private conversation with someone",
          category: "uncommon",
          params: ["nick"],
          requires: ["connection"],
          run: function run() {
              var win = this.chat.createPrivateMessageWindow(this.conn, this.nick);
              return this.chat.switchToWindow(win);
          }
      },
      "kill": {
          description: "kicks a user from the server",
          category: "uncommon",
          params: ["nick", "opt_reason"],
          requires: ["connection"],
          run: function run() {
              return this.conn.irc.doCommand("KILL", this.nick, this.reason);
          }
      },
      "version": {
          description: "get the user's IRC version",
          category: "uncommon",
          params: ["nick"],
          requires: ["connection"],
          run: function run() {
              return this.handleCTCPRequest(this.nick, "VERSION");
          }
      },
      "ignore": {
          description: "stop certain message(s) from being displayed in the current channel, for example '/ignore join part' stops join and part messages from being displayed, a list of ignored messages is displayed if no arguments are given",
          category: "misc",
          params: ["opt_types..."],
          requires: ["connection"],
          usage: "[<message type 1> <message type 2> ...]",
          run: function run() {
              var _this5 = this;

              var types,
                  context = this.win.getContext();
              if (this.types) {
                  types = iter(this.types.split(" ")).tap(function (type) {
                      return _this5.chat.messageHandler.ignoreMessageType(context, type);
                  });
                  return this.displayMessage("notice", "Messages of type " + getReadableList(types) + " will no longer be displayed in this room.");
              } else {
                  types = iter(this.chat.messageHandler.getIgnoredMessages()[context]).values();
                  if (types.isEmpty()) {
                      return this.displayMessage("notice", "Messages of type " + getReadableList(types) + " are being ignored in this room.");
                  } else {
                      return this.displayMessage("notice", "There are no messages being ignored in this room.");
                  }
              }
          }
      },
      "unignore": {
          description: "stop ignoring certain message(s)",
          "extends": "ignore",
          usage: "<message type 1> <message type 2> ...",
          run: function run() {
              var _this6 = this;

              var types = iter(this.types.split(" ")).tap(function (type) {
                  return _this6.chat.messageHandler.stopIgnoringMessageType(_this6.win.getContext(), type);
              });
              return this.displayMessage("notice", "Messages of type " + getReadableList(types) + " are no longer being ignored.");
          }
      },
      "theme": {
          description: "upload and use a custom CSS file, opens a file browser",
          category: "misc",
          run: function run() {
              return loadFromFileSystem(function (content) {
                  window.webkitStorageInfo.requestQuota(PERSISTENT, 50 * 1024, function (grantedBytes) {
                      window.requestFileSystem(PERSISTENT, grantedBytes, function () {}, errorHandler);
                  }, errorHandler);
                  return window.webkitRequestFileSystem(PERSISTENT, 50 * 1024, function (fileSystem) {
                      return fileSystem.root.getFile("custom_style.css", {
                          create: true
                      }, function (fileEntry) {
                          return fileEntry.createWriter(function (writer) {
                              var blob = new Blob([content], {
                                  type: "text/css"
                              });
                              writer.onwriteend = function () {
                                  return $("#main-style").attr("href", fileEntry.toURL());
                              };
                              return writer.write(blob);
                          });
                      });
                  });
              });
          }
      },
      "untheme": {
          description: "Remove the custom CSS file",
          category: "misc",
          run: function run() {
              return window.webkitRequestFileSystem(PERSISTENT, 50 * 1024, function (fileSystem) {
                  fileSystem.root.getFile("custom_style.css", { create: false }, function (fileEntry) {
                      fileEntry.remove(function () {
                          console.info("custom_style.css removed");
                          return $("#main-style").attr("href", "style.css");
                      });
                  });
              });
          }
      },
      /**
       * Hidden commands.
       * These commands don't display in /help or autocomplete. They're used for
       *  scripts and keyboard shortcuts.
       */

      "next-server": {
          description: "switches to the next server window",
          category: "hidden",
          run: function run() {
              var nextServer, server, serverIndex, winList, _ref1;
              winList = this.chat.winList;
              server = winList.getServerForWindow(this.win);
              if (!server) return;
              serverIndex = winList.serverIndexOf(server);
              nextServer = (_ref1 = winList.getServerWindow(serverIndex + 1)) != null ? _ref1 : winList.getServerWindow(0);
              return this.chat.switchToWindow(nextServer);
          }
      },
      "next-room": {
          description: "switches to the next window",
          category: "hidden",
          run: function run() {
              var index, nextWin, winList, _ref1;
              winList = this.chat.winList;
              index = winList.indexOf(this.win);
              if (index < 0) {
                  return;
              }
              nextWin = (_ref1 = winList.get(index + 1)) != null ? _ref1 : winList.get(0);
              return this.chat.switchToWindow(nextWin);
          }
      },
      "previous-room": {
          description: "switches to the next window",
          category: "hidden",
          run: function run() {
              var index, nextWin, winList, _ref1;
              winList = this.chat.winList;
              index = winList.indexOf(this.win);
              if (index < 0) {
                  return;
              }
              nextWin = (_ref1 = winList.get(index - 1)) != null ? _ref1 : winList.get(winList.length - 1);
              return this.chat.switchToWindow(nextWin);
          }
      },
      "reply": {
          description: "begin replying to the user who last mentioned your nick",
          category: "hidden",
          run: function run() {
              var user;
              user = this.chat.getLastUserToMention(this.win.getContext());
              if (!user) {
                  return;
              }
              return this.chat.emit("set_input_if_empty", user + ": ");
          }
      },
      "image": {
          description: "embed an image in a message",
          category: "hidden",
          params: ["src"],
          run: function run() {
              var win = this.win;
              return getEmbedableUrl(this.src, function (url) {
                  var img = $("<img>");
                  img.on("load", function () {
                      img.css("max-width", img[0].width + "px");
                      img.css("width", "100%");
                      return win.rawMessage("", img[0].outerHTML);
                  });
                  return img.attr("src", url);
              });
          }
      },
      "suspend-notifications": {
          description: "suspends notifications temporarily",
          category: "hidden",
          params: ["suspend"],
          run: function run() {
              this.chat.messageHandler.setSuspendNotifications(this.suspend.toLowerCase() == "on");
          }
      }
  };

  /**
   * Handles user commands, including providing help messages and determining if a
   *  command can be run in the current context.
   */

  var UserCommandHandler = function (_MessageHandler) {
      babelHelpers.inherits(UserCommandHandler, _MessageHandler);

      function UserCommandHandler(chat) {
          babelHelpers.classCallCheck(this, UserCommandHandler);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(UserCommandHandler).call(this, chat));

          _this.chat = chat;
          _this._handlers = {};
          _this._init();
          return _this;
      }

      babelHelpers.createClass(UserCommandHandler, [{
          key: "getCommands",
          value: function getCommands() {
              return this._handlers;
          }
      }, {
          key: "getCommand",
          value: function getCommand(command) {
              return this._handlers[command];
          }
      }, {
          key: "listenTo",
          value: function listenTo(emitter) {
              var _this2 = this;

              return emitter.on("command", function (e) {
                  if (_this2.canHandle(e.name)) {
                      return _this2.handle.apply(_this2, [e.name, e].concat(babelHelpers.toConsumableArray(e.args)));
                  }
              });
          }
      }, {
          key: "handle",
          value: function handle() {
              var _command;

              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
              }

              var command,
                  type = args[0],
                  context = args[1],
                  rest = 3 <= arguments.length ? args.slice(2) : [];
              if (!this._isValidUserCommand(type)) {
                  var _babelHelpers$get;

                  // The command must be a developer command
                  (_babelHelpers$get = babelHelpers.get(Object.getPrototypeOf(UserCommandHandler.prototype), "handle", this)).call.apply(_babelHelpers$get, [this, type, context].concat(babelHelpers.toConsumableArray(rest)));
                  return;
              }
              command = this._handlers[type];
              return (_command = command).tryToRun.apply(_command, [context].concat(babelHelpers.toConsumableArray(rest)));
          }
      }, {
          key: "_isValidUserCommand",
          value: function _isValidUserCommand(type) {
              return type in this._handlers;
          }

          /**
           * Creates all user commands. The "this" parameter in the run() and
           *  validateArgs() functions is UserCommand.
           * @this {UserCommand}
           */

      }, {
          key: "_init",
          value: function _init() {
              var _this3 = this;

              // Register commands
              iter(userCommandList).pairs().each(function (_ref) {
                  var _ref2 = babelHelpers.slicedToArray(_ref, 2);

                  var name = _ref2[0];
                  var spec = _ref2[1];
                  return _this3._addCommand(name, spec);
              });
          }
          /**
           * @param  {string} name
           * @param  {{description: string, category: string, params: string[], requires: string[]?, extends: string?, usage: string, validateArgs: Function, run: function}} spec
           */

      }, {
          key: "_addCommand",
          value: function _addCommand(name, spec) {
              var command = new UserCommand(name, spec),
                  commandToExtend = this._handlers[spec["extends"]];
              if (commandToExtend) {
                  command.describe(commandToExtend.description);
              }
              command.setChat(this.chat);
              return this._handlers[name] = command;
          }
      }]);
      return UserCommandHandler;
  }(MessageHandler);

  /**
   * An ordered list of windows with channels sorted by server then alphebetically
   * by name.
   */

  var WindowList = function () {
      function WindowList() {
          babelHelpers.classCallCheck(this, WindowList);

          this._servers = [];
          this.length = 0;
      }
      /**
       * Get the correct window given the server and optionally the channel.
       * @param  {string|number} serverName
       * @param  {any} chan
       * @return {Window|null} window
       */


      babelHelpers.createClass(WindowList, [{
          key: "get",
          value: function get(serverName, chan) {
              if (typeof serverName === "number") return this._getByNumber(serverName);

              for (var i = 0, serLen = this._servers.length; i < serLen; i++) {
                  var server = this._servers[i];
                  if (serverName !== server.name) continue;
                  if (chan == null) return server.serverWindow;
                  for (var j = 0, winLen = server.windows.length; j < winLen; j++) {
                      var win = server.windows[j];
                      if (win.target === chan.toLowerCase()) return win;
                  }
              }
              return null;
          }
      }, {
          key: "_getByNumber",
          value: function _getByNumber(num) {
              var servers = this._servers;
              for (var i = 0, len = servers.length; i < len; i++) {
                  var server = servers[i];
                  if (num === 0) return server.serverWindow;else num -= 1;
                  if (num < server.windows.length) return server.windows[num];else num -= server.windows.length;
              }
              return void 0;
          }
          /**
           * The same as get(), but the index excludes server windows.
           */

      }, {
          key: "getChannelWindow",
          value: function getChannelWindow(index) {
              var servers = this._servers;
              for (var i = 0, len = servers.length; i < len; i++) {
                  var server = servers[i];
                  if (index < server.windows.length) {
                      return server.windows[index];
                  } else {
                      index -= server.windows.length;
                  }
              }
              return void 0;
          }
          /**
           * The same as get(), but the index excludes channel windows.
           */

      }, {
          key: "getServerWindow",
          value: function getServerWindow(index) {
              var serverWindow = this._servers[index];
              return serverWindow != null ? serverWindow.serverWindow : void 0;
          }
      }, {
          key: "add",
          value: function add(win) {
              if (win.target != null) {
                  this._addChannelWindow(win);
              } else {
                  this._addServerWindow(win);
              }
              return this.length++;
          }
      }, {
          key: "_addChannelWindow",
          value: function _addChannelWindow(win) {
              var conn = win.conn,
                  servers = this._servers;
              assert((conn != null ? conn.name : void 0) != null);
              for (var i = 0, len = servers.length; i < len; i++) {
                  var server = servers[i];
                  if (win.conn.name === server.name) {
                      this._addWindowToServer(server, win);
                      return;
                  }
              }
              throw "added channel window with no corresponding connection window: " + win;
          }
      }, {
          key: "_addWindowToServer",
          value: function _addWindowToServer(server, win) {
              server.windows.push(win);
              return server.windows.sort(function (win1, win2) {
                  return win1.target.localeCompare(win2.target);
              });
          }
      }, {
          key: "_addServerWindow",
          value: function _addServerWindow(win) {
              var conn = win.conn;
              assert((conn != null ? conn.name : void 0) != null);
              return this._servers.push({
                  name: win.conn.name,
                  serverWindow: win,
                  windows: []
              });
          }
      }, {
          key: "remove",
          value: function remove(win) {
              var candidate, i, server, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
              _ref1 = this._servers;
              for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
                  server = _ref1[i];
                  if (server.name === ((_ref2 = win.conn) != null ? _ref2.name : void 0)) {
                      if (win.isServerWindow()) {
                          this._servers.splice(i, 1);
                          this.length -= server.windows.length + 1;
                          return server.windows.concat([server.serverWindow]);
                      }
                      _ref3 = server.windows;
                      for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
                          candidate = _ref3[i];
                          if (candidate.target === win.target) {
                              server.windows.splice(i, 1);
                              this.length--;
                              return [candidate];
                          }
                      }
                  }
              }
              return [];
          }

          /**
           * Given a window, returns its corresponding server window.
           * @param {Window} win
           * @return {Window|undefined} The server window.
           */

      }, {
          key: "getServerForWindow",
          value: function getServerForWindow(win) {
              var server, _i, _len, _ref1, _ref2;
              if (win.isServerWindow()) {
                  return win;
              }
              _ref1 = this._servers;
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                  server = _ref1[_i];
                  if (server.name === ((_ref2 = win.conn) != null ? _ref2.name : void 0)) {
                      return server.serverWindow;
                  }
              }
              return void 0;
          }
      }, {
          key: "indexOf",
          value: function indexOf(win) {
              var candidate, count, i, server, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
              if (((_ref1 = win.conn) != null ? _ref1.name : void 0) == null) {
                  return -1;
              }
              count = 0;
              _ref2 = this._servers;
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                  server = _ref2[_i];
                  if (win.conn.name === server.name) {
                      if (win.target == null) {
                          return count;
                      }
                      count++;
                      _ref3 = server.windows;
                      for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
                          candidate = _ref3[i];
                          if (candidate.equals(win)) {
                              return count + i;
                          }
                      }
                      return -1;
                  } else {
                      count += server.windows.length + 1;
                  }
              }
              return -1;
          }
          /**
           * Return the index of a channel relative to other channels of the same server.
           */

      }, {
          key: "localIndexOf",
          value: function localIndexOf(win) {
              var candidate, i, server, _i, _j, _len, _len1, _ref1, _ref2, _ref3;
              if (((_ref1 = win.conn) != null ? _ref1.name : void 0) == null) {
                  return -1;
              }
              _ref2 = this._servers;
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                  server = _ref2[_i];
                  if (win.conn.name !== server.name) {
                      continue;
                  }
                  _ref3 = server.windows;
                  for (i = _j = 0, _len1 = _ref3.length; _j < _len1; i = ++_j) {
                      candidate = _ref3[i];
                      if (candidate.equals(win)) {
                          return i;
                      }
                  }
              }
              return -1;
          }
          /**
           * Returns the index of a server relative to other servers.
           */

      }, {
          key: "serverIndexOf",
          value: function serverIndexOf(win) {
              var i, server, _i, _len, _ref1, _ref2;
              if (((_ref1 = win.conn) != null ? _ref1.name : void 0) == null) {
                  return -1;
              }
              _ref2 = this._servers;
              for (i = _i = 0, _len = _ref2.length; _i < _len; i = ++_i) {
                  server = _ref2[i];
                  if (win.conn.name === server.name) {
                      return i;
                  }
              }
              return -1;
          }
      }]);
      return WindowList;
  }();

  /**
   * A UI element to inform and/or prompt the user.
   */

  var Notice = function () {
      function Notice() {
          var _this = this;

          babelHelpers.classCallCheck(this, Notice);

          this.$notice = $("#notice");
          this.$content = $("#notice .content");
          this.$close = $("#notice button.close");
          this.$option1 = $("#notice button.option1");
          this.$option2 = $("#notice button.option2");
          this.$close.click(function () {
              return _this._hide();
          });
      }
      /**
       * Display a message to the user.
       * The prompt representation has the following format:
       *  "message_text [button_1_text] [button_2_text]"
       *
       * @param {string} representation A string representation of the message.
       * @param {...function} callbacks Specifies what function should be called when
       *  an option is clicked.
       */


      babelHelpers.createClass(Notice, [{
          key: "prompt",
          value: function prompt() {
              var _this2 = this;

              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
              }

              var representation = args[0],
                  callbacks = 2 <= args.length ? args.slice(1) : [];
              this._hide();
              this._callbacks = callbacks;
              this._parseRepresentation(representation);
              this.$option1.click(function () {
                  var _base;
                  _this2._hide();
                  return typeof (_base = _this2._callbacks)[0] === "function" ? _base[0]() : void 0;
              });
              this.$option2.click(function () {
                  var _base;
                  _this2._hide();
                  return typeof (_base = _this2._callbacks)[1] === "function" ? _base[1]() : void 0;
              });
              return this._show();
          }
      }, {
          key: "close",
          value: function close() {
              return this._hide();
          }
      }, {
          key: "_hide",
          value: function _hide() {
              this.$notice.addClass("hide");
              this.$option1.off("click");
              return this.$option2.off("click");
          }
      }, {
          key: "_show",
          value: function _show() {
              this.$notice.removeClass("hide");
          }
      }, {
          key: "_parseRepresentation",
          value: function _parseRepresentation(representation) {
              var options;
              this._setMessageText(representation);
              options = representation.match(/\[.+?\]/g);
              this._setOptionText(this.$option1, options != null ? options[0] : void 0);
              return this._setOptionText(this.$option2, options != null ? options[1] : void 0);
          }
      }, {
          key: "_setMessageText",
          value: function _setMessageText(representation) {
              representation = representation.split("[")[0];
              return this.$content.text($.trim(representation));
          }
      }, {
          key: "_setOptionText",
          value: function _setOptionText(button, textWithBrackets) {
              var text;
              if (textWithBrackets) {
                  text = textWithBrackets.slice(1, +(textWithBrackets.length - 2) + 1 || 9e9);
                  button.removeClass("hidden");
                  return button.text(text);
              } else if (!button.hasClass("hidden")) {
                  return button.addClass("hidden");
              }
          }
      }]);
      return Notice;
  }();

  /**
   * A list of elements that can be manipulated, keyed by case-insensitive strings.
   */

  var HTMLList = function (_EventEmitter) {
      babelHelpers.inherits(HTMLList, _EventEmitter);

      function HTMLList($list, $template) {
          babelHelpers.classCallCheck(this, HTMLList);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(HTMLList).call(this));

          _this.$list = $list;
          _this.$template = $template;
          _this.nodes = {};
          _this.nodeNames = [];
          _this._addFooterNode();
          _this._log = getLogger(_this);
          return _this;
      }

      babelHelpers.createClass(HTMLList, [{
          key: "_addFooterNode",
          value: function _addFooterNode() {
              this._footerNode = this._createNode("footer");
              this.$list.append(this._footerNode.html);
              this._footerNode.html.addClass("footer");
          }

          // Sets the text of the footer node, e.g. '<add channel>' or '<add server>'.

      }, {
          key: "setFooterNodeText",
          value: function setFooterNodeText(text) {
              this._footerNode.content.text(text);
          }
      }, {
          key: "add",
          value: function add(name) {
              return this.insert(this.nodeNames.length, name);
          }
      }, {
          key: "insert",
          value: function insert(index, name) {
              var key = name.toLowerCase();
              if (key in this.nodes) {
                  return;
              }
              if (index < 0 || index > this.nodeNames.length) {
                  throw "invalid index: " + index + "/" + this.nodeNames.length;
              }
              var newNode = this._createNode(name);
              this._insertHTML(index, newNode);
              this.nodes[key] = newNode;
              return this.nodeNames.splice(index, 0, name);
          }
      }, {
          key: "_insertHTML",
          value: function _insertHTML(index, newNode) {
              var nextNode = this.get(index) || this._footerNode;
              this._log("adding", newNode, "at", index, "with next node", nextNode);
              newNode.html.insertBefore(nextNode.html);
          }
      }, {
          key: "get",
          value: function get(index) {
              var key = this.nodeNames[index];
              if (key) {
                  key = key.toLowerCase();
                  return this.nodes[key];
              }
              return false;
          }
      }, {
          key: "getPrevious",
          value: function getPrevious(nodeName) {
              var i = this.nodeNames.indexOf(nodeName);
              return this.nodeNames[i - 1];
          }
      }, {
          key: "getNext",
          value: function getNext(nodeName) {
              var i = this.nodeNames.indexOf(nodeName);
              return this.nodeNames[i + 1];
          }
      }, {
          key: "remove",
          value: function remove(name) {
              var key = name.toLowerCase(),
                  node = this.nodes[key];

              this._log("removing", node);

              if (node) {
                  node.html.remove();
                  delete this.nodes[key];
                  return removeFromArray(this.nodeNames, key);
              }
          }
      }, {
          key: "clear",
          value: function clear() {
              this.nodes = {};
              this.nodeNames = [];
              this.$list.find("li:not(.footer)").remove();
          }
      }, {
          key: "addClass",
          value: function addClass(name, c) {
              var _ref1;
              return (_ref1 = this.nodes[name]) != null ? _ref1.html.addClass(c) : void 0;
          }
      }, {
          key: "removeClass",
          value: function removeClass(name, c) {
              var _ref1;
              return (_ref1 = this.nodes[name]) != null ? _ref1.html.removeClass(c) : void 0;
          }
      }, {
          key: "hasClass",
          value: function hasClass(nodeName, c) {
              var _ref1;
              return (_ref1 = this.nodes[nodeName]) != null ? _ref1.html.hasClass(c) : void 0;
          }
      }, {
          key: "rename",
          value: function rename(name, text) {
              var _ref1;
              return (_ref1 = this.nodes[name]) != null ? _ref1.content.text(text) : void 0;
          }
      }, {
          key: "_createNode",
          value: function _createNode(name) {
              var _this2 = this;

              var node = {
                  html: this._htmlify(name),
                  name: name
              };
              node.content = $(".content-item", node.html);
              node.html.mousedown(function (event) {
                  switch (event.which) {
                      case 1:
                          if ($(event.target).hasClass("remove-button")) {
                              _this2._emitClickEvent(node, "remove_button_clicked");
                          } else {
                              _this2._handleClick(node);
                          }
                          break;
                      case 2:
                          return _this2._handleMiddleClick(node);
                      // case 3: // not handling right-clicks
                  }
              });
              node.html.dblclick(function (event) {
                  if (event.which == 1) {
                      return _this2._handleDoubleClick(node);
                  }
              });
              return node;
          }
      }, {
          key: "_handleClick",
          value: function _handleClick(node) {
              this._emitClickEvent(node, "clicked");
          }
      }, {
          key: "_handleMiddleClick",
          value: function _handleMiddleClick(node) {
              this._emitClickEvent(node, "midclicked");
          }
      }, {
          key: "_handleDoubleClick",
          value: function _handleDoubleClick(node) {
              this._emitClickEvent(node, "dblclicked");
          }
      }, {
          key: "_emitClickEvent",
          value: function _emitClickEvent(node, eventName) {
              var emitType;
              if (node == this._footerNode) {
                  emitType = "footer_" + eventName;
              } else {
                  emitType = eventName;
              }
              this.emit(emitType, node.name);
          }
      }, {
          key: "_htmlify",
          value: function _htmlify(name) {
              var html = this.$template.clone();
              $(".content-item", html).text(name);
              return html;
          }
      }]);
      return HTMLList;
  }(EventEmitter);

  /**
   * A list of servers and channels to which the user is connected.
   */

  var ChannelList = function (_EventEmitter) {
      babelHelpers.inherits(ChannelList, _EventEmitter);

      function ChannelList() {
          babelHelpers.classCallCheck(this, ChannelList);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ChannelList).call(this));

          _this._handleClick = _this._handleClick.bind(_this);
          _this._handleMiddleClick = _this._handleMiddleClick.bind(_this);
          _this.$surface = $("#rooms-container .rooms");
          _this.roomsByServer = {};
          _this._addFooter();
          return _this;
      }

      babelHelpers.createClass(ChannelList, [{
          key: "_addFooter",
          value: function _addFooter() {
              var _this2 = this;

              this._footerHtml = this._createAndAppendServerHTML("+ add server");
              var serverRoomHtml = $(".server", this._footerHtml);
              serverRoomHtml.addClass("footer");
              serverRoomHtml.mousedown(function (event) {
                  if (event.which == 1) {
                      _this2._handleAddServerClick();
                  }
              });
          }
      }, {
          key: "select",
          value: function select(server, channel) {
              this._removeLastSelected();
              this._addClass(server, channel, "selected");
              this._addClass(server, null, "current-server");
              this._removeClass(server, channel, "activity");
              return this._removeClass(server, channel, "mention");
          }
      }, {
          key: "_removeLastSelected",
          value: function _removeLastSelected() {
              this.removeFirstInstanceOfClass("selected");
              this.removeFirstInstanceOfClass("current-server");
          }
      }, {
          key: "removeFirstInstanceOfClass",
          value: function removeFirstInstanceOfClass(cssClass) {
              var elementWithClass = $("." + cssClass, this.$surface);
              if (elementWithClass) {
                  elementWithClass.removeClass(cssClass);
              }
          }
      }, {
          key: "activity",
          value: function activity(server, opt_channel) {
              return this._addClass(server, opt_channel, "activity");
          }
      }, {
          key: "mention",
          value: function mention(server, opt_channel) {
              return this._addClass(server, opt_channel, "mention");
          }
      }, {
          key: "remove",
          value: function remove(server, opt_channel) {
              if (opt_channel != null) {
                  return this.roomsByServer[server].channels.remove(opt_channel);
              } else {
                  this.roomsByServer[server].html.remove();
                  return delete this.roomsByServer[server];
              }
          }
      }, {
          key: "insertChannel",
          value: function insertChannel(i, server, channel) {
              this.roomsByServer[server].channels.insert(i, channel);
              return this.disconnect(server, channel);
          }

          /**
           * Adds a server that will never have any channels, e.g. when we add the
           * welcome window.
           */

      }, {
          key: "addAlwaysEmptyServer",
          value: function addAlwaysEmptyServer(serverName) {
              this.addServer(serverName);
              this._addClass(serverName, null, "always-empty");
          }
      }, {
          key: "addServer",
          value: function addServer(serverName) {
              var channels, html, server;
              html = this._createAndAppendServerHTML(serverName);
              server = $(".server", html);
              channels = this._createChannelList(html);
              this._handleMouseEvents(serverName, server, channels);
              this.roomsByServer[serverName.toLowerCase()] = {
                  html: html,
                  server: server,
                  channels: channels
              };
              return this.disconnect(serverName);
          }
      }, {
          key: "_createAndAppendServerHTML",
          value: function _createAndAppendServerHTML(serverName) {
              var html;
              html = $("#templates .server-channels").clone();
              $(".server .content-item", html).text(serverName);
              if (this._footerHtml) {
                  html.insertBefore(this._footerHtml);
              } else {
                  this.$surface.append(html);
              }
              return html;
          }
      }, {
          key: "_createChannelList",
          value: function _createChannelList(html) {
              var channelList, channelTemplate;
              channelTemplate = $("#templates .channel");
              channelList = new HTMLList($(".channels", html), channelTemplate);
              channelList.setFooterNodeText("+ add channel");
              return channelList;
          }
      }, {
          key: "_handleMouseEvents",
          value: function _handleMouseEvents(serverName, server, channels) {
              var _this3 = this;

              server.mousedown(function (event) {
                  if (event.which == 1) {
                      if ($(event.target).hasClass("remove-button")) {
                          _this3._handleRemoveRoom(serverName);
                      } else {
                          _this3._handleClick(serverName);
                      }
                  }
              });
              channels.on("clicked", function (channelName) {
                  return _this3._handleClick(serverName, channelName);
              });
              channels.on("midclicked", function (channelName) {
                  return _this3._handleMiddleClick(serverName, channelName);
              });
              channels.on("footer_clicked", function () {
                  return _this3._handleAddChannelClick();
              });
              channels.on("remove_button_clicked", function (channelName) {
                  return _this3._handleRemoveRoom(serverName, channelName);
              });
          }
      }, {
          key: "disconnect",
          value: function disconnect(server, opt_channel) {
              return this._addClass(server, opt_channel, "disconnected");
          }
      }, {
          key: "connect",
          value: function connect(server, opt_channel) {
              return this._removeClass(server, opt_channel, "disconnected");
          }
      }, {
          key: "_addClass",
          value: function _addClass(server, channel, c) {
              if (channel != null) {
                  return this.roomsByServer[server].channels.addClass(channel.toLowerCase(), c);
              } else {
                  return this.roomsByServer[server].server.addClass(c);
              }
          }
      }, {
          key: "_removeClass",
          value: function _removeClass(server, channel, c) {
              if (channel != null) {
                  return this.roomsByServer[server].channels.removeClass(channel.toLowerCase(), c);
              } else {
                  return this.roomsByServer[server].server.removeClass(c);
              }
          }
      }, {
          key: "_handleClick",
          value: function _handleClick(server, channel) {
              return this.emit("clicked", server, channel);
          }
      }, {
          key: "_handleMiddleClick",
          value: function _handleMiddleClick(server, channel) {
              return this.emit("midclicked", server, channel);
          }
      }, {
          key: "_handleAddChannelClick",
          value: function _handleAddChannelClick() {
              this.emit("help_type_command", "/join #");
          }
      }, {
          key: "_handleAddServerClick",
          value: function _handleAddServerClick() {
              this.emit("help_type_command", "/server ");
          }
      }, {
          key: "_handleRemoveRoom",
          value: function _handleRemoveRoom(server, channel) {
              this.emit("remove_button_clicked", server, channel);
          }
      }]);
      return ChannelList;
  }(EventEmitter);

  var NotificationGroup = function (_EventEmitter) {
      babelHelpers.inherits(NotificationGroup, _EventEmitter);

      function NotificationGroup(opt_channel) {
          babelHelpers.classCallCheck(this, NotificationGroup);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(NotificationGroup).call(this));

          _this._channel = opt_channel;
          _this._size = 0;
          _this._notification = null;
          _this._stubs = [];
          return _this;
      }

      babelHelpers.createClass(NotificationGroup, [{
          key: "add",
          value: function add(item) {
              var _ref1;
              if ((_ref1 = this._notification) != null) {
                  _ref1.cancel();
              }
              this._size++;
              this._createNotification(item);
              return this._notification.show();
          }
      }, {
          key: "_createNotification",
          value: function _createNotification(item) {
              var body, title;
              this._addStubIfUnique(item.getStub());
              if (this._size === 1) {
                  title = item.getTitle();
                  body = item.getBody();
              } else {
                  if (this._channel) {
                      title = this._size + " notifications in " + this._channel;
                  } else {
                      title = this._size + " notifications";
                  }
                  body = this._stubs.join(", ");
              }
              body = truncateIfTooLarge(body, 75);
              this._notification = new Notification(title, body);
              return this._addNotificationListeners();
          }
      }, {
          key: "_addStubIfUnique",
          value: function _addStubIfUnique(stub) {
              if (this._stubs.indexOf(stub) < 0) {
                  return this._stubs.push(stub);
              }
          }
      }, {
          key: "_addNotificationListeners",
          value: function _addNotificationListeners() {
              var _this2 = this;

              this._notification.on("clicked", function () {
                  return _this2.emit("clicked");
              });
              return this._notification.on("close", function () {
                  return _this2._clear();
              });
          }
      }, {
          key: "clear",
          value: function clear() {
              var _ref1;
              if ((_ref1 = this._notification) != null) {
                  _ref1.cancel();
              }
              this._size = 0;
              return this._stubs = [];
          }
      }]);
      return NotificationGroup;
  }(EventEmitter);

  /**
   * Displays help messages to the user, such as listing the available commands or
   *  keyboard shortcuts.
   */

  var HelpMessageRenderer = function () {
      /**
       * @param {function(opt_message, opt_style)} postMessage
       */

      function HelpMessageRenderer(postMessage) {
          babelHelpers.classCallCheck(this, HelpMessageRenderer);

          this._postMessage = postMessage;
          this._commands = {};
      }
      /**
       * Displays a help message for the given commands, grouped by category.
       * @param {Object.<string: {category: string}>} commands
       */


      babelHelpers.createClass(HelpMessageRenderer, [{
          key: "render",
          value: function render(commands) {
              this._commands = commands;
              this._postMessage();
              this._printCommands();
              this._postMessage(escape("Type '/help <command>' to see details about a specific command."), "notice help");
              return this._postMessage("Type '/hotkeys' to see the list of keyboard shortcuts.", "notice help");
          }
      }, {
          key: "_printCommands",
          value: function _printCommands() {
              var _this = this;

              return this._groupCommandsByCategory().map(function (group) {
                  _this._postMessage(_this._getCommandGroupName(group.category) + " Commands:", HelpMessageRenderer.COMMAND_STYLE);
                  _this._postMessage();
                  _this._printCommandGroup(group.commands.sort());
                  return _this._postMessage();
              });
          }

          /**
           * @return {number} Returns the number of characters in the longest command.
           */

      }, {
          key: "_getMaxCommandLength",
          value: function _getMaxCommandLength() {
              return Object.keys(this._commands).reduce(function (max, command) {
                  return command.length > max ? command.length : max;
              }, 0);
          }

          /**
           * Returns a map of categories mapped to command names.
           * @return {Array.<{string: Array.<string>}>}
           */

      }, {
          key: "_groupCommandsByCategory",
          value: function _groupCommandsByCategory() {
              var categories = iter(this._commands).pairs().reduce(function (categories, _ref) {
                  var _ref2 = babelHelpers.slicedToArray(_ref, 2);

                  var name = _ref2[0];
                  var command = _ref2[1];

                  if (command.category === "hidden") return categories;
                  var category = command.category || "misc";
                  if (categories[category] == null) categories[category] = [];
                  categories[category].push(name);
                  return categories;
              }, {});

              return this._orderGroups(categories);
          }

          /**
           * Given a map of categories to commands, order the categories in the order
           *  we'd like to display to the user.
           * @param {{category: string[]}} categoryToCommands
           * @return {{category: string, commands: string[]}[]}
           */

      }, {
          key: "_orderGroups",
          value: function _orderGroups(categoryToCommands) {
              return HelpMessageRenderer.CATEGORY_ORDER.map(function (category) {
                  return { category: category, commands: categoryToCommands[category] };
              });
          }

          /**
           * Given a category, return the name to display to the user.
           * @param {string} category
           * @return {string}
           */

      }, {
          key: "_getCommandGroupName",
          value: function _getCommandGroupName(category) {
              switch (category) {
                  case "common":
                      return "Basic IRC";
                  case "uncommon":
                      return "Other IRC";
                  case "one_identity":
                      return "One Identity";
                  case "scripts":
                      return "Script";
                  default:
                      return "Misc";
              }
          }

          /**
           * Print an array of commands.
           * @param {string[]} commands
           */

      }, {
          key: "_printCommandGroup",
          value: function _printCommandGroup(commands) {
              var line = commands.map(function (command) {
                  return "<span class=\"help-command\">" + command + "</span>";
              }).join("");
              this._postMessage(line, HelpMessageRenderer.COMMAND_STYLE);
          }

          /**
           * Display a help message detailing the available hotkeys.
           * @param {{description: string, group: string, readableName: string}} hotkeys
           */

      }, {
          key: "renderHotkeys",
          value: function renderHotkeys(hotkeys) {
              var groupsVisited, hotkeyInfo, id, name, _results;
              this._postMessage();
              this._postMessage("Keyboard Shortcuts:", "notice help");
              this._postMessage();
              groupsVisited = {};
              _results = [];
              for (id in hotkeys) {
                  hotkeyInfo = hotkeys[id];
                  if (hotkeyInfo.group) {
                      if (hotkeyInfo.group in groupsVisited) {
                          continue;
                      }
                      groupsVisited[hotkeyInfo.group] = true;
                      name = hotkeyInfo.group;
                  } else {
                      name = hotkeyInfo.readableName;
                  }
                  _results.push(this._postMessage("  " + name + ": " + hotkeyInfo.description, "notice help"));
              }
              return _results;
          }
      }]);
      return HelpMessageRenderer;
  }();
  HelpMessageRenderer.TOTAL_WIDTH = 50;
  /**
   * The order that command categories are displayed to the user.
   */
  HelpMessageRenderer.CATEGORY_ORDER = ["common", "uncommon", "one_identity", "scripts", "misc"];
  HelpMessageRenderer.COMMAND_STYLE = "notice help group";

  /**
   * Handles outputing text to the window and provides functions to display
   * some specific messages like help and about.
   */

  var MessageRenderer = function () {
      function MessageRenderer(win) {
          babelHelpers.classCallCheck(this, MessageRenderer);

          this.win = win;
          this.systemMessage = this.systemMessage.bind(this);

          this._userSawMostRecentMessage = false;
          this._activityMarkerLocation = void 0;
          this._helpMessageRenderer = new HelpMessageRenderer(this.systemMessage);
      }

      babelHelpers.createClass(MessageRenderer, [{
          key: "onFocus",
          value: function onFocus() {
              return this._userSawMostRecentMessage = this.win.$messages.children().length > 0;
          }
      }, {
          key: "displayWelcome",
          value: function displayWelcome() {
              this.systemMessage("Welcome to CIRC!");
              return this.systemMessage(this._getWebsiteBlurb());
          }

          /**
           * Display available commands, grouped by category.
           * @param {Object.<string: {category: string}>} commands
           */

      }, {
          key: "displayHelp",
          value: function displayHelp(commands) {
              return this._helpMessageRenderer.render(commands);
          }
      }, {
          key: "displayHotkeys",
          value: function displayHotkeys(hotkeys) {
              return this._helpMessageRenderer.renderHotkeys(hotkeys);
          }
      }, {
          key: "displayAbout",
          value: function displayAbout() {
              this._addWhitespace();
              this.systemMessage("CIRC is a packaged Chrome app developed by Google Inc. " + this._getWebsiteBlurb(), "notice about");
              this.systemMessage("Version: " + VERSION, "notice about");
              this.systemMessage("Contributors:", "notice about group");
              this.systemMessage("    * Icon by Michael Cook (themichaelcook@gmail.com)", "notice about group");
              return this.systemMessage("    * UI mocks by Fravic Fernando (fravicf@gmail.com)", "notice about group");
          }
      }, {
          key: "_getWebsiteBlurb",
          value: function _getWebsiteBlurb() {
              return "Documentation, issues and source code live at " + PROJECT_URL + ".";
          }

          /**
           * Display content and the source it was from with the given style.
           * @param {string} from
           * @param {string} msg
           * @param {...string} styles
           */

      }, {
          key: "message",
          value: function message(from, msg) {
              from = from || "";
              msg = msg || "";

              for (var _len = arguments.length, styles = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                  styles[_key - 2] = arguments[_key];
              }

              var isHelpMessage = styles[0] && styles[0].split(" ").indexOf("help") != -1,
                  fromNode = this._createSourceFromText(from),
                  msgNode = this._createContentFromText(msg, /* allowHtml */isHelpMessage);

              this.rawMessage(fromNode, msgNode, styles.join(" "));
              if (this._shouldUpdateActivityMarker()) {
                  return this._updateActivityMarker();
              }
          }
      }, {
          key: "_createContentFromText",
          value: function _createContentFromText(msg, allowHtml) {
              if (!msg) return "";
              var node = $("<span>");
              node.html(display(msg, allowHtml));
              return node;
          }
      }, {
          key: "_createSourceFromText",
          value: function _createSourceFromText(from) {
              var node;
              if (!from) {
                  return "";
              }
              node = $("<span>");
              node.text(from);
              return node;
          }

          /**
           * Display a system message to the user. A system message has no from field.
           */

      }, {
          key: "systemMessage",
          value: function systemMessage(msg, style) {
              if (msg == null) {
                  msg = "";
              }
              if (style == null) {
                  style = "system";
              }
              return this.message("", msg, style);
          }

          /**
           * Display a message without escaping the from or msg fields.
           */

      }, {
          key: "rawMessage",
          value: function rawMessage(from, msg, style) {
              var message = this._createMessageHTML(from, msg, style);
              this.win.emit("message", this.win.getContext(), style, message[0].outerHTML);
              this.win.$messages.append(message);
              this.win.$messagesContainer.restoreScrollPosition();
              return this._trimMessagesIfTooMany();
          }

          // mock-hookable function

      }, {
          key: "_createTimestamp",
          value: function _createTimestamp() {
              return new Date();
          }
      }, {
          key: "_createMessageHTML",
          value: function _createMessageHTML(from, msg, style) {
              var message = $("#templates .message").clone();
              message.addClass(style);
              $(".timestamp", message).append(this._createTimestamp().toLocaleTimeString());
              $(".source", message).append(from);
              $(".content", message).append(msg);
              if (!(typeof from.text === "function" ? from.text() : void 0)) {
                  $(".source", message).addClass("empty");
              }
              if (typeof from.text === "function") {
                  $(".source", message).attr("colornumber", hashString(from.text().toLocaleLowerCase()) % 31);
              }
              return message;
          }

          /**
           * Trim chat messages when there are too many in order to save on memory.
           */

      }, {
          key: "_trimMessagesIfTooMany",
          value: function _trimMessagesIfTooMany() {
              var messages = this.win.$messagesContainer.children().children();
              if (!(messages.length > MessageRenderer.MAX_MESSAGES)) {
                  return;
              }
              return messages.map(function (message) {
                  return message.remove();
              });
          }
      }, {
          key: "_addWhitespace",
          value: function _addWhitespace() {
              return this.message();
          }

          /*
           * Update the activity marker when the user has seen the most recent messages
           * and then received a message while the window wasn't focused.
           */

      }, {
          key: "_shouldUpdateActivityMarker",
          value: function _shouldUpdateActivityMarker() {
              return !this.win.isFocused() && this._userSawMostRecentMessage;
          }
      }, {
          key: "_updateActivityMarker",
          value: function _updateActivityMarker() {
              this._userSawMostRecentMessage = false;
              if (this._activityMarkerLocation) {
                  this._activityMarkerLocation.removeClass("activity-marker");
              }
              this._activityMarkerLocation = this.win.$messages.children().last();
              return this._activityMarkerLocation.addClass("activity-marker");
          }
      }]);
      return MessageRenderer;
  }();
  MessageRenderer.MAX_MESSAGES = 3500;

  /**
   * Indicates that a dom element can be scrolled and provides scroll utility
   * functions.
   */

  var Scrollable = function () {
      /**
       * @param {Node} element The jquery DOM element to wrap.
       */

      function Scrollable(node) {
          babelHelpers.classCallCheck(this, Scrollable);

          this._onScroll = this._onScroll.bind(this);

          this._restoreScrollPosition = this._restoreScrollPosition.bind(this);
          this._node = node;
          node.restoreScrollPosition = this._restoreScrollPosition;
          this._scrollPosition = 0;
          this._wasScrolledDown = true;
          $(window).resize(this._restoreScrollPosition);
          $(node).scroll(this._onScroll);
      }

      babelHelpers.createClass(Scrollable, [{
          key: "node",
          value: function node() {
              return this._node;
          }

          /**
           * Restore the scroll position to where the user last scrolled. If the node
           *  was scrolled to the bottom it will remain scrolled to the bottom.
           *
           * This is useful for restoring the scroll position after adding content or
           *  resizing the window.
           */

      }, {
          key: "_restoreScrollPosition",
          value: function _restoreScrollPosition() {
              if (this._wasScrolledDown) {
                  return this._scrollToBottom();
              } else {
                  return this._node.scrollTop(this._scrollPosition);
              }
          }
      }, {
          key: "_scrollToBottom",
          value: function _scrollToBottom() {
              return this._node.scrollTop(this._getScrollHeight());
          }
      }, {
          key: "_onScroll",
          value: function _onScroll() {
              this._wasScrolledDown = this._isScrolledDown();
              return this._scrollPosition = this._node.scrollTop();
          }
      }, {
          key: "_isScrolledDown",
          value: function _isScrolledDown() {
              var scrollPosition;
              scrollPosition = this._node.scrollTop() + this._node.height();
              return scrollPosition >= this._getScrollHeight() - Scrollable.SCROLLED_DOWN_BUFFER;
          }
      }, {
          key: "_getScrollHeight",
          value: function _getScrollHeight() {
              return this._node[0].scrollHeight;
          }
      }]);
      return Scrollable;
  }();
  Scrollable.SCROLLED_DOWN_BUFFER = 8;

  // TODO sort first by op status, then name

  var NickList = function (_HTMLList) {
      babelHelpers.inherits(NickList, _HTMLList);

      function NickList(surface) {
          babelHelpers.classCallCheck(this, NickList);
          return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(NickList).call(this, surface, $("#templates .nick")));
      }

      babelHelpers.createClass(NickList, [{
          key: "add",
          value: function add(nick) {
              return this.insert(this._getClosestIndex(nick), nick);
          }
      }, {
          key: "_getClosestIndex",
          value: function _getClosestIndex(nick) {
              nick = nick.toLowerCase();
              for (var i = 0, l = this.nodeNames.length; i < l; ++i) {
                  var name = this.nodeNames[i];
                  if (name.toLowerCase() > nick) {
                      return i;
                  }
              }
              return this.nodeNames.length;
          }
      }]);
      return NickList;
  }(HTMLList);

  /**
   * A window for a specific IRC channel.
   */

  var Window = function (_EventEmitter) {
      babelHelpers.inherits(Window, _EventEmitter);

      function Window(server, opt_channel) {
          babelHelpers.classCallCheck(this, Window);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Window).call(this));

          _this._onBlur = _this._onBlur.bind(_this);
          _this._onFocus = _this._onFocus.bind(_this);
          _this.name = server + (opt_channel ? " " + opt_channel : "");
          _this.messageRenderer = new MessageRenderer(_this);
          _this._addUI();
          _this.notifications = new NotificationGroup(opt_channel);
          _this._isVisible = false;
          _this._isFocused = false;
          _this._height = 0;
          _this._private = false;

          $(window).focus(_this._onFocus);
          $(window).blur(_this._onBlur);

          var dragging;
          $(".dragbar").mousedown(function (e) {
              e.preventDefault();
              dragging = true;
              var main = $("#messages-and-input");
              var ghostbar = $("<div>", {
                  id: "ghostbar",
                  css: {
                      height: main.outerHeight(),
                      top: main.offset().top,
                      left: main.offset().left - 4
                  }
              }).appendTo("body");
              $(document).mousemove(function (e) {
                  ghostbar.css("left", e.pageX);
              });
          });

          $(document).mouseup(function (e) {
              if (dragging) {
                  $("#rooms-and-nicks").css("width", e.pageX);
                  $("#ghostbar").remove();
                  $(document).unbind("mousemove");
                  dragging = false;
              }
          });
          return _this;
      }

      babelHelpers.createClass(Window, [{
          key: "getContext",
          value: function getContext() {
              if (this._context == null) this._context = new Context(this.conn != null ? this.conn.name : void 0, this.target);

              return this._context;
          }
      }, {
          key: "_onFocus",
          value: function _onFocus() {
              if (!this._isVisible) return;

              this._isFocused = true;
              this.notifications.clear();
              return this.messageRenderer.onFocus();
          }
      }, {
          key: "_onBlur",
          value: function _onBlur() {
              return this._isFocused = false;
          }
      }, {
          key: "isFocused",
          value: function isFocused() {
              return this._isFocused && this._isVisible;
          }
      }, {
          key: "_addUI",
          value: function _addUI() {
              this._addMessageUI();
              this._addNickUI();
              return this.$roomsAndNicks = $("#rooms-and-nicks");
          }
      }, {
          key: "_addMessageUI",
          value: function _addMessageUI() {
              this.$messagesContainer = new Scrollable($("#messages-container")).node();
              return this.$messages = $("#templates .messages").clone();
          }
      }, {
          key: "_addNickUI",
          value: function _addNickUI() {
              this.$nicksContainer = $("#nicks-container");
              this.$nicks = $("#templates .nicks").clone();
              return this.nicks = new NickList(this.$nicks);
          }

          /**
           * Sets the window's channel.
           * @param {string} target
           */

      }, {
          key: "setTarget",
          value: function setTarget(target) {
              this.target = target;
              if (this.isPrivate()) {
                  return;
              }
              return this.$roomsAndNicks.removeClass("no-nicks");
          }
      }, {
          key: "isServerWindow",
          value: function isServerWindow() {
              return !this.target;
          }
      }, {
          key: "equals",
          value: function equals(win) {
              return this.name === win.name;
          }

          /**
           * Marks the window as private.
           * Private windows are used for direct messages from /msg.
           */

      }, {
          key: "makePrivate",
          value: function makePrivate() {
              return this._private = true;
          }
      }, {
          key: "isPrivate",
          value: function isPrivate() {
              return this._private;
          }
      }, {
          key: "detach",
          value: function detach() {
              this.$roomsAndNicks.addClass("no-nicks");
              this.$messages.detach();
              this.$nicks.detach();
              return this._isVisible = false;
          }
      }, {
          key: "remove",
          value: function remove() {
              this.detach();
              this.$messages.remove();
              return this.$nicks.remove();
          }
      }, {
          key: "attach",
          value: function attach() {
              this._isVisible = true;
              this._onFocus();
              if (this.target && !this.isPrivate()) {
                  this.$roomsAndNicks.removeClass("no-nicks");
              }
              this.$messagesContainer.append(this.$messages);
              this.$nicksContainer.append(this.$nicks);
              return this.$messagesContainer.restoreScrollPosition();
          }
          /**
           * @param  {any} from
           * @param  {any} msg
           * @param  {any} ...style
           */

      }, {
          key: "message",
          value: function message() {
              var _messageRenderer;

              return (_messageRenderer = this.messageRenderer).message.apply(_messageRenderer, arguments);
          }

          /**
           * Display a raw html to the user.
           * This is useful for scripts to embed images or video.
           */

      }, {
          key: "rawMessage",
          value: function rawMessage(from, node) {
              for (var _len = arguments.length, style = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                  style[_key - 2] = arguments[_key];
              }

              return this.messageRenderer.rawMessage(from, node, style.join(" "));
          }

          /**
           * Append raw html to the message list.
           * This is useful for adding a large number of messages quickly, such as
           * loading chat history.
           */

      }, {
          key: "rawHTML",
          value: function rawHTML(html) {
              this.$messages.html(this.$messages.html() + html);
              return this.$messagesContainer.restoreScrollPosition();
          }
      }, {
          key: "clear",
          value: function clear() {
              return this.$messages.html("");
          }
      }]);
      return Window;
  }(EventEmitter);

  /**
   * Walks first time users through the basics of CIRC.
   *
   * TODO: It would be awesome if this was implemented as a script.
   */

  var Walkthrough = function (_EventEmitter) {
      babelHelpers.inherits(Walkthrough, _EventEmitter);

      /**
       * @param {{getCurrentContext: function(), displayMessage: function()}} messageDisplayer
       * @param {Storage} storageState The current state of what's loaded from storage
       */

      function Walkthrough(messageDisplayer, storageState) {
          babelHelpers.classCallCheck(this, Walkthrough);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Walkthrough).call(this));

          _this._handleIRCEvent = _this._handleIRCEvent.bind(_this);
          _this._messageDisplayer = messageDisplayer;
          _this._steps = ["start", "server", "channel", "end"];
          _this._findWalkthroughPoisition(storageState);
          _this._beginWalkthrough();
          return _this;
      }
      /**
           * Determine which step the user is on in the walkthrough. They may have left
           *  half way through.
           */


      babelHelpers.createClass(Walkthrough, [{
          key: "_findWalkthroughPoisition",
          value: function _findWalkthroughPoisition(storageState) {
              if (storageState.channelsLoaded) {
                  this._currentStep = 3;
              } else if (storageState.serversLoaded) {
                  this._currentStep = 2;
              } else if (storageState.nickLoaded) {
                  this._currentStep = 1;
              } else {
                  this._currentStep = 0;
              }
              return this._startingStep = this._currentStep;
          }

          /**
           * Based on where the user is in the walkthrough, determine the first message
           *  the user sees.
           */

      }, {
          key: "_beginWalkthrough",
          value: function _beginWalkthrough() {
              var step;
              step = this._steps[this._currentStep];
              if (step === "end") {
                  this.emit("tear_down");
                  return;
              }
              if (step === "channel") {
                  // Wait for the server to connect before displaying anything.
                  this._currentStep--;
                  return;
              }
              return this._displayStep(step);
          }

          /**
           * @param {EventEmitter} ircEvents
           */

      }, {
          key: "listenToIRCEvents",
          value: function listenToIRCEvents(ircEvents) {
              return ircEvents.on("server", this._handleIRCEvent);
          }
      }, {
          key: "_handleIRCEvent",
          value: function _handleIRCEvent(event) {
              this._context = event.context;
              switch (event.name) {
                  case "nick":
                      return this._displayWalkthrough("server");
                  case "connect":
                      return this._displayWalkthrough("channel");
                  case "joined":
                      return this._displayWalkthrough("end");
              }
          }
      }, {
          key: "_displayWalkthrough",
          value: function _displayWalkthrough(type) {
              var position;
              position = this._steps.indexOf(type);
              if (position > this._currentStep) {
                  this._currentStep = position;
                  return this._displayStep(type);
              }
          }
      }, {
          key: "_displayStep",
          value: function _displayStep(name) {
              return this["_" + name + "Walkthrough"](this._context || this._messageDisplayer.getCurrentContext());
          }
      }, {
          key: "_isFirstMessage",
          value: function _isFirstMessage() {
              return this._currentStep === this._startingStep;
          }

          /**
           * Display a message to the user.
           */

      }, {
          key: "_message",
          value: function _message(msg, style) {
              var context = this._messageDisplayer.getCurrentContext();
              style = style || "system";
              return this._messageDisplayer.displayMessage(style, context, msg);
          }
      }, {
          key: "_startWalkthrough",
          value: function _startWalkthrough() {
              return this._message("To get started, set your nickname with /nick <my_nick>.");
          }
      }, {
          key: "_serverWalkthrough",
          value: function _serverWalkthrough() {
              if (this._isFirstMessage()) {
                  this._message("Join a server by typing /server <server> [port].");
              } else {
                  this._message("Great! Now join a server by typing /server <server> [port].");
              }
              return this._message("For example, you can connect to freenode by typing /server chat.freenode.net.");
          }
      }, {
          key: "_channelWalkthrough",
          value: function _channelWalkthrough(context) {
              var _this2 = this;

              /**
               * Display after a delay to allow for MOTD and other output to be displayed.
               */
              return setTimeout(function () {
                  return _this2._displayChannelWalkthough(context);
              }, Walkthrough.SERVER_OUTPUT_DELAY);
          }
      }, {
          key: "_displayChannelWalkthough",
          value: function _displayChannelWalkthough(context) {
              this._message("You've successfully connected to " + context.server + ".");
              return this._message("Join a channel with /join <#channel>.");
          }
      }, {
          key: "_endWalkthrough",
          value: function _endWalkthrough(context) {
              if (!this._isFirstMessage()) {
                  this._message("Awesome, you've connected to " + context.channel + ".");
              }
              this._message("If you're ever stuck, type /help to see a list of all commands.");
              this._message("You can switch windows with alt+[0-9] or click in the channel list on the left.");
              return this.emit("tear_down");
          }
      }]);
      return Walkthrough;
  }(EventEmitter);
  Walkthrough.SERVER_OUTPUT_DELAY = 1000;

  /**
   * Manages storage
   */

  var Storage = function (_EventEmitter) {
      babelHelpers.inherits(Storage, _EventEmitter);

      function Storage(chat) {
          babelHelpers.classCallCheck(this, Storage);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Storage).call(this));

          _this._restoreScripts = _this._restoreScripts.bind(_this);
          _this._onChanged = _this._onChanged.bind(_this);
          _this._chat = chat;
          _this._log = getLogger(_this);
          _this._scripts = [];
          _this._channels = [];
          _this._servers = [];
          _this._nick = void 0;
          _this._autostart = void 0;
          _this.password = void 0;
          _this.serverDevice = void 0;
          chrome.storage.onChanged.addListener(_this._onChanged);
          _this.pause();
          return _this;
      }

      /**
       * Save an object to sync storage for the script with the given name.
       * @param {string} name A unique name representing the script.
       * @param {Object} item The item to store.
       */


      babelHelpers.createClass(Storage, [{
          key: "saveItemForScript",
          value: function saveItemForScript(name, item) {
              return this._store(this._getScriptStorageHandle(name), item);
          }

          /**
           * Load an object from sync storage for the script with the given name.
           * @param {string} name A unique name representing the script.
           * @param {function(Object)} onLoaded The function that is called once the item
           *     is loaded.
           */

      }, {
          key: "loadItemForScript",
          value: function loadItemForScript(name, onLoaded) {
              var storageHandle = this._getScriptStorageHandle(name);
              return chrome.storage.sync.get(storageHandle, function (state) {
                  return onLoaded(state[storageHandle]);
              });
          }

          /**
           * Clears the item stored for the given script. This is called after a script
           *  is uninstalled.
           * @param {string} name A unique name representing the script.
           */

      }, {
          key: "clearScriptStorage",
          value: function clearScriptStorage(name) {
              return chrome.storage.sync.remove(this._getScriptStorageHandle(name));
          }
      }, {
          key: "_getScriptStorageHandle",
          value: function _getScriptStorageHandle(name) {
              return "script_" + name;
          }

          /**
           * Listen for storage changes.
           * If the password updated then change our own. If the password was cleared
           *  then restore it.
           * @param  {any} changeMap
           * @param  {any} areaName
           */

      }, {
          key: "_onChanged",
          value: function _onChanged(changeMap) {
              var _this2 = this;

              if (changeMap.password) {
                  this._onPasswordChange(changeMap.password);
              }
              if (changeMap.server_device) {
                  this._onServerDeviceChange(changeMap.server_device);
              }
              return this._scripts.map(function (script) {
                  var change = changeMap[_this2._getScriptStorageHandle(script.getName())];
                  if (change) return _this2._chat.scriptHandler.storageChanged(script, change);
                  return void 0;
              });
          }
      }, {
          key: "_onPasswordChange",
          value: function _onPasswordChange(passwordChange) {
              this._log("password changed from", passwordChange.oldValue, "to", passwordChange.newValue);
              if (passwordChange.newValue === this.password) return;
              if (passwordChange.newValue) {
                  this.password = passwordChange.newValue;
                  return this._chat.setPassword(this.password);
              } else {
                  this._log("password was cleared. Setting password back to", this.password);
                  return this._store("password", this.password);
              }
          }
      }, {
          key: "_onServerDeviceChange",
          value: function _onServerDeviceChange(serverChange) {
              this._log("device server changed from", getFieldOrNull(serverChange, ["oldValue", "addr"]), getFieldOrNull(serverChange, ["oldValue", "port"]), "to", getFieldOrNull(serverChange, ["newValue", "addr"]), getFieldOrNull(serverChange, ["newValue", "port"]));
              if (serverChange.newValue) {
                  this.serverDevice = serverChange.newValue;
                  return this._chat.remoteConnectionHandler.determineConnection(this.serverDevice);
              } else if (this.serverDevice) {
                  return this._store("server_device", this.serverDevice);
              }
          }

          /**
           * Stops storing state items (channel, server, nick).
           * This is used when the client is resuming it's IRC state and doesn't want
           *  to make redudant writes to storage.
           */

      }, {
          key: "pause",
          value: function pause() {
              return this._paused = true;
          }
      }, {
          key: "resume",
          value: function resume() {
              return this._paused = false;
          }
      }, {
          key: "setAutostart",
          value: function setAutostart(opt_enabled) {
              var enabled;
              enabled = opt_enabled != null ? opt_enabled : !this._autostart;
              this._autostart = enabled;
              this._store("autostart", enabled);
              return this._autostart;
          }
      }, {
          key: "finishedWalkthrough",
          value: function finishedWalkthrough() {
              return this._store("completed_walkthrough", true, "local");
          }
      }, {
          key: "finishedLoadingPrepackagedScripts",
          value: function finishedLoadingPrepackagedScripts() {
              return this._store("loaded_prepackaged_scripts", true, "local");
          }
      }, {
          key: "nickChanged",
          value: function nickChanged(nick) {
              if (this._nick === nick) {
                  return;
              }
              this._nick = nick;
              return this._store("nick", nick);
          }
      }, {
          key: "channelJoined",
          value: function channelJoined(server, name, type, key) {
              var chan, channelObj, i, _i, _len, _ref1;
              type = type || "normal";
              _ref1 = this._channels;
              for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
                  chan = _ref1[i];
                  if (chan.server === server && chan.name === name) {
                      if (chan.key !== key) {
                          this._channels.splice(i, 1);
                          break;
                      }
                      return;
                  }
              }
              channelObj = {
                  server: server,
                  name: name,
                  key: key
              };
              if (type !== "normal") {
                  channelObj.type = type;
              }
              this._channels.push(channelObj);
              return this._store("channels", this._channels);
          }
      }, {
          key: "serverJoined",
          value: function serverJoined(name, port, password) {
              if (this._isDuplicateServer(name, port)) {
                  return;
              }
              this._servers.push({
                  name: name,
                  port: port,
                  password: password
              });
              return this._store("servers", this._servers);
          }
      }, {
          key: "_isDuplicateServer",
          value: function _isDuplicateServer(name, port) {
              var _this3 = this;

              return this._servers.some(function (server, i) {
                  if (server.name === name) {
                      if (server.port === port) {
                          return true;
                      }
                      _this3._servers.splice(i, 1);
                      return false;
                  }
              });
          }
      }, {
          key: "parted",
          value: function parted(server, channel) {
              if (channel != null) {
                  return this._channelParted(server, channel);
              } else {
                  return this._serverParted(server);
              }
          }
      }, {
          key: "_channelParted",
          value: function _channelParted(server, name) {
              var index = this._channels.findIndex(function (channel) {
                  return channel.server === server && channel.name.toLowerCase() === name.toLowerCase();
              });
              this._channels.splice(index, 1);
              return this._store("channels", this._channels);
          }
      }, {
          key: "_serverParted",
          value: function _serverParted(name) {
              var index = this._servers.findIndex(function (server) {
                  return server.name === name;
              });
              if (index >= 0) {
                  this._servers.splice(index, 1);
                  return this._store("servers", this._servers);
              }
          }
      }, {
          key: "ignoredMessagesChanged",
          value: function ignoredMessagesChanged() {
              return this._store("ignored_messages", this._getIgnoredMessages());
          }
      }, {
          key: "_getIgnoredMessages",
          value: function _getIgnoredMessages() {
              return this._chat.messageHandler.getIgnoredMessages();
          }
      }, {
          key: "scriptAdded",
          value: function scriptAdded(script) {
              if (this._isDuplicateScript(script)) return;
              this._scripts.push(script);
              return this._store("scripts", this._scripts, "local");
          }
      }, {
          key: "scriptRemoved",
          value: function scriptRemoved(scriptToRemove) {
              var index = this._scripts.findIndex(function (script) {
                  return script.id === scriptToRemove.id;
              });
              if (index >= 0) {
                  this._scripts.splice(index, 1);
                  this._store("scripts", this._scripts, "local");
              }
          }
      }, {
          key: "_isDuplicateScript",
          value: function _isDuplicateScript(newScript) {
              return this._scripts.some(function (script) {
                  return script.id === newScript.id;
              });
          }
      }, {
          key: "_store",
          value: function _store(key, value, type) {
              var storageObj;
              type = type || "sync";
              if (!this.shouldStore(key)) return;
              this._log("storing", key, "=>", value, "to", type);
              storageObj = {};
              storageObj[key] = value;
              if (type === "sync") {
                  return chrome.storage.sync.set(storageObj);
              } else {
                  return chrome.storage.local.set(storageObj);
              }
          }
      }, {
          key: "shouldStore",
          value: function shouldStore(key) {
              return !(this._paused && Storage.STATE_ITEMS.indexOf(key) >= 0);
          }
      }, {
          key: "getState",
          value: function getState() {
              return {
                  ircStates: this._createIRCStates(),
                  servers: this._servers,
                  channels: this._channels,
                  nick: this._nick,
                  ignoredMessages: this._getIgnoredMessages()
              };
          }
      }, {
          key: "_createIRCStates",
          value: function _createIRCStates() {
              return iter(this._chat.connections).values().map(function (connection) {
                  return {
                      server: connection.name,
                      state: connection.irc.state,
                      channels: connection.irc.channels,
                      away: connection.irc.away,
                      nick: connection.irc.nick
                  };
              });
          }

          /**
           * Load initial items, such as whether to show the walkthrough.
           */

      }, {
          key: "init",
          value: function init() {
              var _this4 = this;

              return chrome.storage.local.get(Storage.INITIAL_ITEMS_LOCAL, function (state) {
                  _this4._initializeLocalItems(state);
                  return chrome.storage.sync.get(Storage.INITIAL_ITEMS, function (state) {
                      _this4._initializeSyncItems(state);
                      return _this4.emit("initialized");
                  });
              });
          }
      }, {
          key: "_initializeSyncItems",
          value: function _initializeSyncItems(state) {
              this._state = state;
              this._restorePassword();
              this._loadServerDevice();
              return this._autostart = state.autostart;
          }
      }, {
          key: "_initializeLocalItems",
          value: function _initializeLocalItems(state) {
              this.completedWalkthrough = state["completed_walkthrough"];
              this.loadedPrepackagedScripts = state["loaded_prepackaged_scripts"];
              return this._restoreScripts(state);
          }
      }, {
          key: "_restoreScripts",
          value: function _restoreScripts(state) {
              var _this5 = this;

              if (!state.scripts) return;
              this._log(state.scripts.length, "scripts loaded from storage:", state.scripts);
              return ScriptLoader$1.loadScriptsFromStorage(state.scripts, function (script) {
                  _this5._scripts.push(script);
                  return _this5._chat.scriptHandler.addScript(script);
              });
          }
      }, {
          key: "restoreSavedState",
          value: function restoreSavedState(opt_callback) {
              var _this6 = this;

              return chrome.storage.sync.get(Storage.STATE_ITEMS, function (savedState) {
                  _this6.loadState(savedState);
                  return typeof opt_callback === "function" ? opt_callback() : void 0;
              });
          }
      }, {
          key: "loadState",
          value: function loadState(state) {
              this._state = state;
              this._restoreNick();
              this._restoreServers();
              this._restoreChannels();
              this._restoreIgnoredMessages();
              this._restoreIRCStates();
              return this._markItemsAsLoaded(Storage.STATE_ITEMS, state);
          }
      }, {
          key: "_restorePassword",
          value: function _restorePassword() {
              this.password = this._state.password;
              if (!this.password) {
                  this.password = randomName();
                  this._log("no password found, setting new password to", this.password);
                  this._store("password", this.password);
              } else {
                  this._log("password loaded from storage:", this.password);
              }
              this._chat.setPassword(this.password);
              return this._chat.remoteConnectionHandler.determineConnection();
          }
      }, {
          key: "_restoreServers",
          value: function _restoreServers() {
              var _this7 = this;

              var servers = this._state.servers;
              if (!servers) return;
              this._servers = servers;
              return servers.map(function (server) {
                  return _this7._chat.connect(server.name, server.port, server.password);
              });
          }
      }, {
          key: "_restoreChannels",
          value: function _restoreChannels() {
              var _this8 = this;

              var channels = this._state.channels;
              if (!channels) return;
              this._channels = channels;

              return channels.reduce(function (cs, channel) {
                  var connection = _this8._chat.connections[channel.server];
                  if (!connection) return cs;
                  if (channel.type === "private") {
                      cs.push(_this8._chat.createPrivateMessageWindow(connection, channel.name));
                  } else {
                      cs.push(_this8._chat.join(connection, channel.name, channel.key));
                  }
                  return cs;
              }, []);
          }
      }, {
          key: "_restoreIgnoredMessages",
          value: function _restoreIgnoredMessages() {
              var ignoredMessages = this._state["ignored_messages"];
              if (!ignoredMessages) return;
              this._log("restoring ignored messages from storage:", ignoredMessages);
              return this._chat.messageHandler.setIgnoredMessages(ignoredMessages);
          }
      }, {
          key: "_restoreNick",
          value: function _restoreNick() {
              var nick = this._state.nick;
              if (!(nick && typeof nick === "string")) return;
              this._nick = nick;
              return this._chat.setNick(nick);
          }
      }, {
          key: "_restoreIRCStates",
          value: function _restoreIRCStates() {
              var _this9 = this;

              var connectedServers,
                  ircStates = this._state.ircStates;
              if (!ircStates) return;

              connectedServers = ircStates.map(function (ircState) {
                  var connection = _this9._chat.connections[ircState.server];
                  if (connection) {
                      _this9._setIRCState(connection, ircState);
                  }
                  return ircState.server;
              });
              return this._disconnectServersWithNoState(connectedServers);
          }
      }, {
          key: "_disconnectServersWithNoState",
          value: function _disconnectServersWithNoState(connectedServers) {
              return iter(this._chat.connections).pairs().filter(function (_ref) {
                  var _ref2 = babelHelpers.slicedToArray(_ref, 1);

                  var name = _ref2[0];
                  return connectedServers.indexOf(name) < 0;
              }).each(function (_ref3) {
                  var _ref4 = babelHelpers.slicedToArray(_ref3, 2);

                  var connection = _ref4[1];
                  return connection.irc.state = "disconnected";
              });
          }
      }, {
          key: "_getNicksInChannel",
          value: function _getNicksInChannel(channel) {
              return iter(channel.names).values();
          }

          /**
           * Loads servers, channels and nick from the given IRC state.
           * The state has the following format:
           * {
           *  nick: string,
           *  channels: Array<{sevrer, name}>,
           *  servers: Array<{name, port}>,
           *  irc_state: object,
           *  server_device: {port: number, addr: string},
           *  password: string
           * }
           * @param {Object} ircState An object that represents the current state of an IRC client.
           */

      }, {
          key: "_setIRCState",
          value: function _setIRCState(conn, ircState) {
              var _this10 = this;

              if (ircState.state === "connected") this._chat.onConnected(conn);
              if (ircState.state) conn.irc.state = ircState.state;
              if (ircState.away) conn.irc.away = ircState.away;
              if (ircState.channels) conn.irc.channels = ircState.channels;
              conn.irc.nick = ircState.nick;
              if (!ircState.channels) return;

              return iter(ircState.channels).pairs().each(function (_ref5) {
                  var _ref6 = babelHelpers.slicedToArray(_ref5, 2);

                  var channelName = _ref6[0];
                  var channel = _ref6[1];

                  _this10._chat.onJoined(conn, channelName);
                  return _this10._chat.onNames({
                      context: {
                          server: conn.name,
                          channel: channelName
                      }
                  }, _this10._getNicksInChannel(channel));
              });
          }
      }, {
          key: "_loadServerDevice",
          value: function _loadServerDevice() {
              this.loadedServerDevice = true;
              this.serverDevice = this._state.server_device;
              if (!this.serverDevice) {
                  this._log("no remote server found", this._state);
              }
              if (this.serverDevice) {
                  this._log("loaded server device", this.serverDevice);
              }
              return this._chat.remoteConnectionHandler.determineConnection();
          }

          /**
           * Marks that a certain item has been loaded from storage.
           */

      }, {
          key: "_markItemsAsLoaded",
          value: function _markItemsAsLoaded(items, state) {
              var _this11 = this;

              return items.map(function (item) {
                  return _this11[item + "Loaded"] = state[item] != null;
              });
          }
      }, {
          key: "becomeServerDevice",
          value: function becomeServerDevice(connectionInfo) {
              this.serverDevice = {
                  addr: connectionInfo.addr,
                  port: connectionInfo.port
              };
              return this._store("server_device", this.serverDevice);
          }
      }]);
      return Storage;
  }(EventEmitter);
  Storage.STATE_ITEMS = ["nick", "servers", "channels", "ignored_messages"];

  /**
   * Items loaded from sync storage on startup
   */
  Storage.INITIAL_ITEMS = ["password", "server_device", "autostart"];

  /**
   * Items loaded from local storage on startup
   */
  Storage.INITIAL_ITEMS_LOCAL = ["completed_walkthrough", "scripts", "loaded_prepackaged_scripts"];

  var KeyCodes = function () {
      function KeyCodes() {
          babelHelpers.classCallCheck(this, KeyCodes);
      }

      babelHelpers.createClass(KeyCodes, [{
          key: "toKeyCode",

          /**
           * Given one or more characters, return their ascii values.
           * @param {string...} chars
           * @return {string|Array.<string>|undefined}
           */
          value: function toKeyCode() {
              var _this = this;

              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
              }

              var codes = args.map(function (char) {
                  return _this._charToKeyCode[char];
              });
              if (args.length < 2) {
                  return codes[0];
              } else {
                  return codes;
              }
          }
      }]);
      return KeyCodes;
  }();

  KeyCodes.prototype._charToKeyCode = {
      "BACKSPACE": 8,
      "TAB": 9,
      "ENTER": 13,
      "SHIFT": 16,
      "CONTROL": 17,
      "ALT": 18,
      "CAPSLOCK": 20,
      "ESCAPE": 27,
      "SPACE": 32,
      "PAGEUP": 33,
      "PAGEDOWN": 34,
      "END": 35,
      "HOME": 36,
      "LEFT": 37,
      "UP": 38,
      "RIGHT": 39,
      "DOWN": 40,
      "INSERT": 45,
      "DELETE": 46,
      "0": 48,
      "1": 49,
      "2": 50,
      "3": 51,
      "4": 52,
      "5": 53,
      "6": 54,
      "7": 55,
      "8": 56,
      "9": 57,
      "A": 65,
      "B": 66,
      "C": 67,
      "D": 68,
      "E": 69,
      "F": 70,
      "G": 71,
      "H": 72,
      "I": 73,
      "J": 74,
      "K": 75,
      "L": 76,
      "M": 77,
      "N": 78,
      "O": 79,
      "P": 80,
      "Q": 81,
      "R": 82,
      "S": 83,
      "T": 84,
      "U": 85,
      "V": 86,
      "W": 87,
      "X": 88,
      "Y": 89,
      "Z": 90,
      "F1": 112,
      "F2": 113,
      "F3": 114,
      "F4": 115,
      "F5": 116,
      "F6": 117,
      "F7": 118,
      "F8": 119,
      "F9": 110,
      "F10": 121,
      "F11": 122,
      "F12": 123,
      "[": 119,
      "]": 121,
      ";": 186,
      "=": 187,
      ",": 188,
      "-": 189,
      ".": 190,
      "/": 191,
      "`": 192,
      "\\": 220,
      "'": 222
  };

  var keyCodes = new KeyCodes();

  /**
   * Maps keyboard shortcuts to commands and their arguments.
   */

  var KeyboardShortcutMap = function () {
      function KeyboardShortcutMap() {
          babelHelpers.classCallCheck(this, KeyboardShortcutMap);

          this._hotkeyMap = {};
          this._mapHotkeys();
      }
      /**
       * Returns the mapping of hotkeys to commands.
       * @param {Object.<string: {description: string, group: string,
       *     readableName: string, command: string, args: Array<Object>}>} hotkeys
       */


      babelHelpers.createClass(KeyboardShortcutMap, [{
          key: "getMap",
          value: function getMap() {
              return this._hotkeyMap;
          }

          /**
           * Get the command for the given shortcut if it is valid.
           * @param {KeyboardEvent} shortcut
           * @param {boolean} hasInput True if the input DOM element has text.
           * @return {[string, Array.<Object>]} Returns the name of the command with its
           *     arguments
           */

      }, {
          key: "getMappedCommand",
          value: function getMappedCommand(shortcut, hasInput) {
              var args, command, keyCombination;
              if (!this._isValidShortcut(shortcut, hasInput)) {
                  return [];
              }
              keyCombination = KeyboardShortcutMap.getKeyCombination(shortcut);
              if (!this._isMapped(keyCombination)) {
                  return [];
              }
              command = this._hotkeyMap[keyCombination].command;
              args = this._hotkeyMap[keyCombination].args;
              return [command, args];
          }

          /**
           * Returns true if the given keyboard input event is a valid keyboard shortcut.
           * @param {KeyboardEvent} shortcut
           * @param {boolean} hasInput True if the input DOM element has text.
           * @return {boolean}
           */

      }, {
          key: "_isValidShortcut",
          value: function _isValidShortcut(keyEvent, hasInput) {
              var key = keyEvent.which;
              if (keyEvent.metaKey || keyEvent.ctrlKey || keyEvent.altKey) {
                  return true;
              } else if (KeyboardShortcutMap.NO_MODIFIER_HOTKEYS.indexOf(key) >= 0) {
                  return true;
              } else {
                  return !hasInput && KeyboardShortcutMap.NO_INPUT_HOTKEYS.indexOf(key) >= 0;
              }
          }

          /**
           * Returns true if the given shortcut has a command mapped to it.
           * @param {string} shortcutName
           * @return {boolean}
           */

      }, {
          key: "_isMapped",
          value: function _isMapped(keyCombination) {
              return keyCombination in this._hotkeyMap;
          }

          /**
           * Maps hotkeys to commands and their arguments.
           * Note: The modifier key order is important and must be consistant with
           *  getKeyCombination().
           * * command: What command the hotkey maps to.
           * * group: What group of hotkeys the hotkey belongs to.
           * * description: A quick description of the command. The command name is used by default.
           * * args: What args should be passed in to the command.
           */

      }, {
          key: "_mapHotkeys",
          value: function _mapHotkeys() {
              var _this = this;

              for (var windowNumber = 1; windowNumber <= 9; windowNumber += 1) {
                  this._addHotkey("Ctrl-" + windowNumber, {
                      command: "win",
                      group: "Ctrl-#",
                      description: "switch channels",
                      args: [windowNumber]
                  });
              }
              var nextRoomArray = ["Alt-DOWN", "Ctrl-TAB", "Alt-PAGEDOWN"];
              var previousRoomArray = ["Alt-UP", "Ctrl-Shift-TAB", "Alt-PAGEUP"];

              nextRoomArray.forEach(function (keys) {
                  return _this._addHotkey(keys, { command: "next-room" });
              });
              previousRoomArray.forEach(function (keys) {
                  return _this._addHotkey(keys, { command: "previous-room" });
              });
              this._addHotkey("Ctrl-W", {
                  command: "part",
                  description: "close current channel/private chat"
              });
              this._addHotkey("Alt-S", {
                  command: "next-server"
              });
              return this._addHotkey("TAB", {
                  command: "reply",
                  description: "autocomplete or reply to last mention"
              });
          }

          /**
           * TODO: Implement the following commands:
           *
           *    @_addHotkey 'PAGEUP',
           *      command: 'pageup'
           *
           *    @_addHotkey 'PAGEDOWN',
           *      command: 'pageup'
           *
           *   @_addHotkey 'Ctrl-F',
           *     command: 'search'
           *
           *   @_addHotkey 'Ctrl-HOME',
           *     command: 'scroll-to-top'
           *
           *   @_addHotkey 'Ctrl-END',
           *     command: 'scroll-to-bottom'
           */

      }, {
          key: "_addHotkey",
          value: function _addHotkey(keyCombination, description) {
              var hotkeyCode = this._getHotkeyCode(keyCombination);
              if (description.args == null) description.args = [];
              this._hotkeyMap[hotkeyCode] = description;
              this._hotkeyMap[hotkeyCode].readableName = keyCombination;
              if (description.description) {
                  return this._hotkeyMap[hotkeyCode].description = description.description;
              } else {
                  return this._hotkeyMap[hotkeyCode].description = description.command.replace(/-/g, " ");
              }
          }

          /**
           * Convert a readable key combination into its key code value.
           * (e.g. 'Alt-S' becomes 'Alt-115').
           */

      }, {
          key: "_getHotkeyCode",
          value: function _getHotkeyCode(keyCombination) {
              var char, parts;
              parts = keyCombination.split("-");
              char = parts[parts.length - 1];
              parts[parts.length - 1] = keyCodes.toKeyCode(char);
              return parts.join("-");
          }
      }]);
      return KeyboardShortcutMap;
  }();
  KeyboardShortcutMap.getKeyCombination = function getKeyCombination(e) {
      var name = [];
      if (e.ctrlKey) {
          name.push("Ctrl");
      }
      if (e.metaKey) {
          name.push("Meta");
      }
      if (e.altKey) {
          name.push("Alt");
      }
      if (e.shiftKey) {
          name.push("Shift");
      }
      name.push(e.which);
      return name.join("-");
  };
  /**
  * These keys can be mapped to hotkeys without needing a modifier key to be down.
  */
  KeyboardShortcutMap.NO_MODIFIER_HOTKEYS = keyCodes.toKeyCode("PAGEUP", "PAGEDOWN", "CAPSLOCK", "INSERT", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12");

  /**
   * These keys can be mapped to hotkeys without needing a modifier key to be
   * down, but only if there is no input entered.
   */
  KeyboardShortcutMap.NO_INPUT_HOTKEYS = [keyCodes.toKeyCode("TAB")];

  function isDigit(c) {
      return c >= "0" && c <= "9";
  }

  /**
   * Represents a device running CIRC and handles communication to/from that
   *  device.
   */

  var RemoteDevice = function (_EventEmitter) {
      babelHelpers.inherits(RemoteDevice, _EventEmitter);

      function RemoteDevice(addr, port) {
          babelHelpers.classCallCheck(this, RemoteDevice);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(RemoteDevice).call(this));

          _this._listenOnValidPort = _this._listenOnValidPort.bind(_this);
          _this._onReceive = _this._onReceive.bind(_this);
          _this._onReceiveError = _this._onReceiveError.bind(_this);

          _this._receivedMessages = "";
          _this.id = addr;
          _this._isClient = false;
          if (typeof addr === "string") {
              _this._initFromAddress(addr, port);
          } else if (addr) {
              _this._initFromSocketId(addr);
          } else {
              _this.port = RemoteDevice.FINDING_PORT;
          }
          return _this;
      }

      babelHelpers.createClass(RemoteDevice, [{
          key: "equals",
          value: function equals(otherDevice) {
              return this.id === (otherDevice != null ? otherDevice.id : void 0);
          }
      }, {
          key: "usesConnection",
          value: function usesConnection(connectionInfo) {
              return connectionInfo.addr === this.addr && connectionInfo.port === this.port;
          }
      }, {
          key: "getState",
          value: function getState() {
              if (!this.addr) {
                  return "no_addr";
              }
              switch (this.port) {
                  case RemoteDevice.FINDING_PORT:
                      return "finding_port";
                  case RemoteDevice.NO_PORT:
                      return "no_port";
                  default:
                      return "found_port";
              }
          }
      }, {
          key: "_initFromAddress",
          value: function _initFromAddress(addr, port) {
              this.addr = addr;
              this.port = port;
          }
      }, {
          key: "_initFromSocketId",
          value: function _initFromSocketId(_socketId) {
              this._socketId = _socketId;
              this._isClient = true;
              return this._listenForData();
          }
      }, {
          key: "findPossibleAddrs",
          value: function findPossibleAddrs(callback) {
              var _this2 = this;

              return chrome.system.network.getNetworkInterfaces(function (networkInfoList) {
                  _this2.possibleAddrs = networkInfoList.map(function (networkInfo) {
                      return networkInfo.address;
                  });
                  _this2.addr = _this2._getValidAddr(_this2.possibleAddrs);
                  return callback();
              });
          }
      }, {
          key: "_getValidAddr",
          value: function _getValidAddr(addrs) {
              if (!addrs || addrs.length === 0) {
                  return void 0;
              }
              /**
               * TODO: currently we return the first IPv4 address. Will this always work?
               */
              return addrs.reduce(function (shortest, addr) {
                  return addr.length < shortest.length ? addr : shortest;
              });
          }
      }, {
          key: "hasGetNetworkInterfacesSupport",
          value: function hasGetNetworkInterfacesSupport() {
              if (getNetworkInterfacesSupported()) return true;
              this._log("w", "chrome.system.network.getNetworkInterfaces is not supported!");
              this.possibleAddrs = [];
              this.port = RemoteDevice.NO_PORT;
              return false;
          }

          /**
           * Call chrome.system.network.getNetworkInterfaces in an attempt to find a valid address.
           */

      }, {
          key: "searchForAddress",
          value: function searchForAddress(callback, timeout) {
              var _this3 = this;

              if (timeout == null) timeout = 500;
              if (!this.hasGetNetworkInterfacesSupport()) return;
              if (timeout > 60000) timeout = 60000;
              return setTimeout(function () {
                  return _this3.findPossibleAddrs(function () {
                      return _this3.addr ? callback() : _this3.searchForAddress(callback, timeout *= 1.2);
                  });
              }, timeout);
          }

          /**
           * Called when the device is your own device. Listens for connecting client
           *  devices.
           */

      }, {
          key: "listenForNewDevices",
          value: function listenForNewDevices(callback) {
              var _this4 = this;

              var _ref;
              return (_ref = chrome.sockets.tcpServer) != null ? _ref.create({}, function (socketInfo) {
                  _this4._socketId = socketInfo.socketId;
                  registerTcpServer(socketInfo.socketId);
                  if (listenSupported()) {
                      return _this4._listenOnValidPort(callback);
                  }
              }) : void 0;
          }

          /**
           * Attempt to listen on the default port, then increment the port by a random
           *  amount if the attempt fails and try again.
           */

      }, {
          key: "_listenOnValidPort",
          value: function _listenOnValidPort(callback, port) {
              var _this5 = this;

              if (!(port >= 0)) {
                  port = RemoteDevice.BASE_PORT;
              }
              return chrome.sockets.tcpServer.listen(this._socketId, "0.0.0.0", port, function (result) {
                  return _this5._onListen(callback, port, result);
              });
          }
      }, {
          key: "_onListen",
          value: function _onListen(callback, port, result) {
              if (result < 0) {
                  return this._onFailedToListen(callback, port, result);
              } else {
                  this.port = port;
                  this.emit("found_port", this);
                  this._acceptNewConnection(callback);
              }
          }
      }, {
          key: "_onFailedToListen",
          value: function _onFailedToListen(callback, port, result) {
              if (port - RemoteDevice.BASE_PORT > RemoteDevice.MAX_CONNECTION_ATTEMPTS) {
                  this._log("w", "Couldn't listen to 0.0.0.0 on any attempted ports", chrome.runtime.lastError.message + " (error " + -result + ")");
                  this.port = RemoteDevice.NO_PORT;
                  return this.emit("no_port");
              } else {
                  return this._listenOnValidPort(callback, port + Math.floor(Math.random() * 100));
              }
          }
      }, {
          key: "_acceptNewConnection",
          value: function _acceptNewConnection(callback) {
              var _this6 = this;

              this._log("listening for new connections on port", this.port);
              // TODO(rpaquay): When do we remove the listener?
              chrome.sockets.tcpServer.onAccept.addListener(function (acceptInfo) {
                  if (_this6._socketId != acceptInfo.socketId) return;
                  _this6._onAccept(acceptInfo, callback);
              });
          }
      }, {
          key: "_onAccept",
          value: function _onAccept(acceptInfo, callback) {
              this._log("Connected to a client device", this._socketId);
              registerSocketConnection(acceptInfo.clientSocketId);
              var device = new RemoteDevice(acceptInfo.clientSocketId);
              device.getAddr(function () {
                  return callback(device);
              });
          }

          /**
           * Called when acting as a server. Finds the client ip address.
           */

      }, {
          key: "getAddr",
          value: function getAddr(callback) {
              var _this7 = this;

              var _ref;
              return (_ref = chrome.sockets.tcp) != null ? _ref.getInfo(this._socketId, function (socketInfo) {
                  _this7.addr = socketInfo.peerAddress;
                  return callback();
              }) : void 0;
          }
      }, {
          key: "send",
          value: function send(type, args) {
              var _this8 = this;

              if (args) {
                  // Convert Uint8Arrays to regular JS arrays for stringify.
                  // TODO(flackr): Preferably this would be done earlier so that send
                  // doesn't need to know what's being sent.
                  args = args.map(function (arg) {
                      return arg instanceof Uint8Array ? Array.from(arg) : arg;
                  });
              }
              var msg = JSON.stringify({ type: type, args: args });
              msg = msg.length + "$" + msg;
              return toSocketData(msg, function (data) {
                  var _ref;
                  return (_ref = chrome.sockets.tcp) != null ? _ref.send(_this8._socketId, data, function (sendInfo) {
                      if (sendInfo.resultCode < 0 || sendInfo.bytesSent !== data.byteLength) {
                          _this8._log("w", "closing b/c failed to send:", type, args, chrome.runtime.lastError.message + " (error " + -sendInfo.resultCode + ")");
                          return _this8.close();
                      } else {
                          return _this8._log("sent", type, args);
                      }
                  }) : void 0;
              });
          }

          /**
           * Called when the device represents a remote server. Creates a connection
           *  to that remote server.
           */

      }, {
          key: "connect",
          value: function connect(callback) {
              var _this9 = this;

              var tcp = chrome.sockets.tcp;
              this.close();
              return tcp != null ? tcp.create(function (socketInfo) {
                  _this9._socketId = socketInfo.socketId;
                  _this9._isClient = true;
                  if (!_this9._socketId) callback(false);
                  tcp.setPaused(_this9._socketId, true, function () {
                      return tcp != null ? tcp.connect(_this9._socketId, _this9.addr, _this9.port, function (result) {
                          return _this9._onConnect(result, callback);
                      }) : void 0;
                  });
              }) : void 0;
          }
      }, {
          key: "_onConnect",
          value: function _onConnect(result, callback) {
              if (result < 0) {
                  this._log("w", "Couldn't connect to server", this.addr, "on port", this.port, "-", chrome.runtime.lastError + " (error " + -result + ")");
                  return callback(false);
              } else {
                  this._listenForData();
                  return callback(true);
              }
          }
      }, {
          key: "close",
          value: function close() {
              if (this._socketId) {
                  if (this._isClient) {
                      chrome.sockets.tcp.onReceive.removeListener(this._onReceive);
                      chrome.sockets.tcp.onReceiveError.removeListener(this._onReceiveError);
                      registerSocketConnection(this._socketId, true);
                      chrome.sockets.tcp.disconnect(this._socketId);
                      chrome.sockets.tcp.close(this._socketId);
                  } else {
                      //chrome.sockets.tcp.onAccept.removeListener(this._onAccept);
                      registerTcpServer(this._socketId, true);
                      chrome.sockets.tcp.disconnect(this._socketId);
                      chrome.sockets.tcp.close(this._socketId);
                  }
                  this._socketId = undefined;
                  return this.emit("closed", this);
              }
          }
      }, {
          key: "_onReceive",
          value: function _onReceive(receiveInfo) {
              var _this10 = this;

              if (receiveInfo.socketId != this._socketId) return;

              fromSocketData(receiveInfo.data, function (partialMessage) {
                  var completeMessages;
                  _this10._receivedMessages += partialMessage;
                  completeMessages = _this10._parseReceivedMessages();

                  return completeMessages.map(function (data) {
                      _this10._log.apply(_this10, ["received", data.type].concat(babelHelpers.toConsumableArray(data.args)));
                      return _this10.emit.apply(_this10, [data.type, _this10].concat(babelHelpers.toConsumableArray(data.args)));
                  });
              });
          }
      }, {
          key: "_onReceiveError",
          value: function _onReceiveError(receiveInfo) {
              if (receiveInfo.socketId != this._socketId) return;

              this._log("w", "bad read - closing socket: ", "(error " + -receiveInfo.resultCode + ")");
              this.emit("closed", this);
              this.close();
          }
      }, {
          key: "_listenForData",
          value: function _listenForData() {
              chrome.sockets.tcp.onReceive.addListener(this._onReceive);
              chrome.sockets.tcp.onReceiveError.addListener(this._onReceiveError);
              chrome.sockets.tcp.setPaused(this._socketId, false, function () {});
          }
      }, {
          key: "_parseReceivedMessages",
          value: function _parseReceivedMessages(result) {
              var length, message, prefixEnd;
              result = result || [];
              if (!this._receivedMessages) return result;
              if (this._receivedMessages.length && !isDigit(this._receivedMessages[0])) {
                  this._log.apply(this, ["received message doesn't begin with digit: ", this._receivedMessages]);
              }
              prefixEnd = this._receivedMessages.indexOf("$");
              if (!(prefixEnd >= 0)) return result;
              length = parseInt(this._receivedMessages.slice(0, +(prefixEnd - 1) + 1 || 9e9));
              if (!(this._receivedMessages.length > prefixEnd + length)) return result;
              message = this._receivedMessages.slice(prefixEnd + 1, +(prefixEnd + length) + 1 || 9e9);
              try {
                  var json = JSON.parse(message);
                  result.push(json);
                  if (JSON.stringify(json).length != length) {
                      this._log("e", "json length mismatch");
                  }
              } catch (e) {
                  this._log("e", "failed to parse json: " + message);
              }
              if (this._receivedMessages.length > prefixEnd + length + 1 && !isDigit(this._receivedMessages[prefixEnd + length + 1])) {
                  this._log("e", "message after split doesn't begin with digit: " + this._receivedMessages);
              }
              this._receivedMessages = this._receivedMessages.slice(prefixEnd + length + 1);
              return this._parseReceivedMessages(result);
          }
      }, {
          key: "toString",
          value: function toString() {
              if (this.addr) {
                  return this.addr + " on port " + this.port;
              } else {
                  return "" + this.socketId;
              }
          }
      }]);
      return RemoteDevice;
  }(EventEmitter);

  RemoteDevice.getOwnDevice = function (callback) {
      var device = new RemoteDevice();
      if (!device.hasGetNetworkInterfacesSupport()) {
          callback(device);
          return;
      }
      if (!listenSupported()) {
          device.port = RemoteDevice.NO_PORT;
      }
      return device.findPossibleAddrs(function () {
          return callback(device);
      });
  };

  /**
   * Begin at this port and increment by one until an open port is found.
   */
  RemoteDevice.BASE_PORT = 1329;

  RemoteDevice.MAX_CONNECTION_ATTEMPTS = 30;

  RemoteDevice.FINDING_PORT = -1;

  RemoteDevice.NO_PORT = -2;

  /**
   * A fake socket used when using another device's IRC connection.
   */

  var RemoteSocket = function (_AbstractTCPSocket) {
      babelHelpers.inherits(RemoteSocket, _AbstractTCPSocket);

      function RemoteSocket() {
          var _Object$getPrototypeO;

          babelHelpers.classCallCheck(this, RemoteSocket);

          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
          }

          return babelHelpers.possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(RemoteSocket)).call.apply(_Object$getPrototypeO, [this].concat(args)));
      }

      babelHelpers.createClass(RemoteSocket, [{
          key: "setTimeout",
          value: function setTimeout() {}
      }, {
          key: "_active",
          value: function _active() {}
      }]);
      return RemoteSocket;
  }(AbstractTCPSocket);

  var SslSocket = function (_ChromeSocket) {
      babelHelpers.inherits(SslSocket, _ChromeSocket);

      function SslSocket() {
          babelHelpers.classCallCheck(this, SslSocket);
          return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(SslSocket).call(this));
      }

      babelHelpers.createClass(SslSocket, [{
          key: "_onConnect",
          value: function _onConnect(rc) {
              var _this2 = this;

              try {
                  this.secure(function (status) {
                      if (status < 0) {
                          _this2.emit("error", "Socket #" + _this2.socketId + " failed to upgrade to a secure connection with code " + rc);
                          _this2.close();
                      } else {
                          babelHelpers.get(Object.getPrototypeOf(SslSocket.prototype), "_onConnect", _this2).call(_this2, rc);
                          console.info("Successfully secured the connection");
                      }
                  });
              } catch (e) {
                  this.emit("error", "Socket #" + this.socketId + " failed to upgrade to a secure connection with code " + rc);
                  console.error(e.stack);
              }
          }
      }, {
          key: "secure",
          value: function secure(callback) {
              if (!this.socketId) {
                  this.emit("error", "Socket #" + this.socketId + " is not created. Failed to upgrade.");
                  callback(-1);
                  return;
              }
              chrome.sockets.tcp.secure(this.socketId, callback);
          }
      }]);
      return SslSocket;
  }(ChromeSocket);

  /*
   * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
   * Digest Algorithm, as defined in RFC 1321.
   * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
   * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
   * Distributed under the BSD License
   * See http://pajhome.org.uk/crypt/md5 for more info.
   */

  /*
   * Configurable variables. You may need to tweak these to be compatible with
   * the server-side, but the defaults work in most cases.
   */
  var hexcase = 0; /* base-64 pad character. "=" for strict RFC compliance   */

  /*
   * These are the functions you'll usually want to call
   * They take string arguments and return either hex or base-64 encoded strings
   */
  function hex_md5(s) {
      return rstr2hex(rstr_md5(str2rstr_utf8(s)));
  }
  /*
   * Calculate the MD5 of a raw string
   */
  function rstr_md5(s) {
      return binl2rstr(binl_md5(rstr2binl(s), s.length * 8));
  }

  /*
   * Convert a raw string to a hex string
   */
  function rstr2hex(input) {
      try {
          hexcase;
      } catch (e) {
          hexcase = 0;
      }
      var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
      var output = "";
      var x;
      for (var i = 0; i < input.length; i++) {
          x = input.charCodeAt(i);
          output += hex_tab.charAt(x >>> 4 & 0x0F) + hex_tab.charAt(x & 0x0F);
      }
      return output;
  }

  /*
   * Encode a string as utf-8.
   * For efficiency, this assumes the input is valid utf-16.
   */
  function str2rstr_utf8(input) {
      var output = "";
      var i = -1;
      var x, y;

      while (++i < input.length) {
          /* Decode utf-16 surrogate pairs */
          x = input.charCodeAt(i);
          y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
          if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
              x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
              i++;
          }

          /* Encode output as utf-8 */
          if (x <= 0x7F) output += String.fromCharCode(x);else if (x <= 0x7FF) output += String.fromCharCode(0xC0 | x >>> 6 & 0x1F, 0x80 | x & 0x3F);else if (x <= 0xFFFF) output += String.fromCharCode(0xE0 | x >>> 12 & 0x0F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);else if (x <= 0x1FFFFF) output += String.fromCharCode(0xF0 | x >>> 18 & 0x07, 0x80 | x >>> 12 & 0x3F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);
      }
      return output;
  }

  /*
   * Convert a raw string to an array of little-endian words
   * Characters >255 have their high-byte silently ignored.
   */
  function rstr2binl(input) {
      var output = Array(input.length >> 2);
      for (var i = 0; i < output.length; i++) {
          output[i] = 0;
      }for (var _i = 0; _i < input.length * 8; _i += 8) {
          output[_i >> 5] |= (input.charCodeAt(_i / 8) & 0xFF) << _i % 32;
      }return output;
  }

  /*
   * Convert an array of little-endian words to a string
   */
  function binl2rstr(input) {
      var output = "";
      for (var i = 0; i < input.length * 32; i += 8) {
          output += String.fromCharCode(input[i >> 5] >>> i % 32 & 0xFF);
      }return output;
  }

  /*
   * Calculate the MD5 of an array of little-endian words, and a bit length.
   */
  function binl_md5(x, len) {
      /* append padding */
      x[len >> 5] |= 0x80 << len % 32;
      x[(len + 64 >>> 9 << 4) + 14] = len;

      var a = 1732584193;
      var b = -271733879;
      var c = -1732584194;
      var d = 271733878;

      for (var i = 0; i < x.length; i += 16) {
          var olda = a;
          var oldb = b;
          var oldc = c;
          var oldd = d;

          a = md5_ff(a, b, c, d, x[i + 0], 7, -680876936);
          d = md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
          c = md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
          b = md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
          a = md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
          d = md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
          c = md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
          b = md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
          a = md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
          d = md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
          c = md5_ff(c, d, a, b, x[i + 10], 17, -42063);
          b = md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
          a = md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
          d = md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
          c = md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
          b = md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

          a = md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
          d = md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
          c = md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
          b = md5_gg(b, c, d, a, x[i + 0], 20, -373897302);
          a = md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
          d = md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
          c = md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
          b = md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
          a = md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
          d = md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
          c = md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
          b = md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
          a = md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
          d = md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
          c = md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
          b = md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

          a = md5_hh(a, b, c, d, x[i + 5], 4, -378558);
          d = md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
          c = md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
          b = md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
          a = md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
          d = md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
          c = md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
          b = md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
          a = md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
          d = md5_hh(d, a, b, c, x[i + 0], 11, -358537222);
          c = md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
          b = md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
          a = md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
          d = md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
          c = md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
          b = md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

          a = md5_ii(a, b, c, d, x[i + 0], 6, -198630844);
          d = md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
          c = md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
          b = md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
          a = md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
          d = md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
          c = md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
          b = md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
          a = md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
          d = md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
          c = md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
          b = md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
          a = md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
          d = md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
          c = md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
          b = md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

          a = safe_add(a, olda);
          b = safe_add(b, oldb);
          c = safe_add(c, oldc);
          d = safe_add(d, oldd);
      }
      return Array(a, b, c, d);
  }

  /*
   * These functions implement the four basic operations the algorithm uses.
   */
  function md5_cmn(q, a, b, x, s, t) {
      return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
  }
  function md5_ff(a, b, c, d, x, s, t) {
      return md5_cmn(b & c | ~b & d, a, b, x, s, t);
  }
  function md5_gg(a, b, c, d, x, s, t) {
      return md5_cmn(b & d | c & ~d, a, b, x, s, t);
  }
  function md5_hh(a, b, c, d, x, s, t) {
      return md5_cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5_ii(a, b, c, d, x, s, t) {
      return md5_cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  /*
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */
  function safe_add(x, y) {
      var lsw = (x & 0xFFFF) + (y & 0xFFFF);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return msw << 16 | lsw & 0xFFFF;
  }

  /*
   * Bitwise rotate a 32-bit number to the left.
   */
  function bit_rol(num, cnt) {
      return num << cnt | num >>> 32 - cnt;
  }

  /**
   * Handles sending and receiving data from connected devices running different
   * instances of CIRC.
   */

  var RemoteConnection = function (_EventEmitter) {
      babelHelpers.inherits(RemoteConnection, _EventEmitter);

      function RemoteConnection() {
          babelHelpers.classCallCheck(this, RemoteConnection);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(RemoteConnection).call(this));

          _this._onDeviceClosed = _this._onDeviceClosed.bind(_this);
          _this._onConnectionMessage = _this._onConnectionMessage.bind(_this);
          _this._onSocketData = _this._onSocketData.bind(_this);
          _this._onUserInput = _this._onUserInput.bind(_this);
          _this._authenticateDevice = _this._authenticateDevice.bind(_this);
          _this._addUnauthenticatedDevice = _this._addUnauthenticatedDevice.bind(_this);
          _this._onHasOwnDevice = _this._onHasOwnDevice.bind(_this);
          _this._getAuthToken = _this._getAuthToken.bind(_this);

          _this.serverDevice = void 0;
          _this._connectingTo = void 0;
          _this._type = void 0;
          _this.devices = [];
          _this._ircSocketMap = {};
          _this._thisDevice = {};
          _this._state = "device_state";
          _this._getIRCState = function () {};
          _this._getChatLog = function () {};
          return _this;
      }
      /**
       * Begin finding own IP addr and then listen for incoming connections.
       */


      babelHelpers.createClass(RemoteConnection, [{
          key: "init",
          value: function init() {
              return RemoteDevice.getOwnDevice(this._onHasOwnDevice);
          }
      }, {
          key: "setPassword",
          value: function setPassword(password) {
              return this._password = password;
          }
      }, {
          key: "_getAuthToken",
          value: function _getAuthToken(value) {
              return hex_md5(this._password + value);
          }
      }, {
          key: "getConnectionInfo",
          value: function getConnectionInfo() {
              return this._thisDevice;
          }
      }, {
          key: "getState",
          value: function getState() {
              if (this._state === "device_state") {
                  if (!this._thisDevice.port) {
                      return "finding_port";
                  }
                  return this._thisDevice.getState();
              } else {
                  return this._state;
              }
          }
      }, {
          key: "setIRCStateFetcher",
          value: function setIRCStateFetcher(getState) {
              return this._getIRCState = getState;
          }
      }, {
          key: "setChatLogFetcher",
          value: function setChatLogFetcher(getChatLog) {
              return this._getChatLog = getChatLog;
          }
      }, {
          key: "_onHasOwnDevice",
          value: function _onHasOwnDevice(device) {
              var _this2 = this;

              this._thisDevice = device;
              if (this._thisDevice.getState() === "no_addr") {
                  this._log("w", "Wasn't able to find address of own device");
                  this.emit("no_addr");
                  this._thisDevice.searchForAddress(function () {
                      return _this2._onHasOwnDevice(_this2._thisDevice);
                  });
                  return;
              }
              this.emit("found_addr");
              return this._thisDevice.listenForNewDevices(this._addUnauthenticatedDevice);
          }
      }, {
          key: "_addUnauthenticatedDevice",
          value: function _addUnauthenticatedDevice(device) {
              this._log("adding unauthenticated device", device.id);
              device.password = randomName();
              device.send("authentication_offer", [device.password]);
              return device.on("authenticate", this._authenticateDevice);
          }
      }, {
          key: "_authenticateDevice",
          value: function _authenticateDevice(device, authToken) {
              if (authToken === this._getAuthToken(device.password)) {
                  return this._addClientDevice(device);
              } else {
                  this._log("w", "AUTH FAILED", authToken, "should be", this._getAuthToken(device.password));
                  return device.close();
              }
          }
      }, {
          key: "_addClientDevice",
          value: function _addClientDevice(device) {
              this._log("auth passed, adding client device", device.id, device.addr);
              this._listenToDevice(device);
              this._addDevice(device);
              this.emit("client_joined", device);
              device.send("connection_message", ["irc_state", this._getIRCState()]);
              return device.send("connection_message", ["chat_log", this._getChatLog()]);
          }
      }, {
          key: "_addDevice",
          value: function _addDevice(newDevice) {
              this.devices.forEach(function (device) {
                  if (device.addr === newDevice.addr) device.close();
              });
              return this.devices.push(newDevice);
          }
      }, {
          key: "_listenToDevice",
          value: function _listenToDevice(device) {
              var _this3 = this;

              device.on("user_input", this._onUserInput);
              device.on("socket_data", this._onSocketData);
              device.on("connection_message", this._onConnectionMessage);
              device.on("closed", this._onDeviceClosed);
              return device.on("no_port", function () {
                  return _this3.emit("no_port");
              });
          }
      }, {
          key: "_onUserInput",
          value: function _onUserInput(device, event) {
              if (this.isServer()) {
                  this._broadcast(device, "user_input", event);
              }
              return this.emit(event.type, Event.wrap(event));
          }
      }, {
          key: "_onSocketData",
          value: function _onSocketData(device, server, type, data) {
              var _ref;
              if (type === "data") {
                  data = arrayToArrayBuffer(data);
              }
              return (_ref = this._ircSocketMap[server]) != null ? _ref.emit(type, data) : void 0;
          }
      }, {
          key: "_onConnectionMessage",
          value: function _onConnectionMessage() {
              for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
              }

              var isValid,
                  device = args[0],
                  type = args[1],
                  rest = 3 <= args.length ? args.slice(2) : [];
              if (type === "irc_state") {
                  isValid = this._onIRCState(device, rest);
                  if (!isValid) return;
              }
              return this.emit.apply(this, [type].concat(args));
          }
      }, {
          key: "_onIRCState",
          value: function _onIRCState(device, args) {
              if (this.getState() !== "connecting") {
                  this._log("w", "got IRC state, but we're not connecting to a server -", device.toString(), args);
                  device.close();
                  return false;
              }
              this._setServerDevice(device);
              this._becomeClient();
              return true;
          }
      }, {
          key: "_setServerDevice",
          value: function _setServerDevice(device) {
              var _ref;
              if ((_ref = this.serverDevice) != null) {
                  _ref.close();
              }
              return this.serverDevice = device;
          }
      }, {
          key: "_onDeviceClosed",
          value: function _onDeviceClosed(closedDevice) {
              if (this._deviceIsClient(closedDevice)) {
                  this.emit("client_parted", closedDevice);
              }
              if (this._deviceIsServer(closedDevice) && this.getState() === "connected") {
                  this._log("w", "lost connection to server -", closedDevice.addr);
                  this._state = "device_state";
                  this._type = void 0;
                  this.emit("server_disconnected");
              } else if (closedDevice.equals(this._connectingTo) && this.getState() !== "connected") {
                  this.emit("invalid_server");
              }

              this.devices = this.devices.filter(function (device) {
                  return device.id !== closedDevice.id;
              });
              return this.devices;
          }
      }, {
          key: "_deviceIsServer",
          value: function _deviceIsServer(device) {
              return device != null ? device.equals(this.serverDevice) : void 0;
          }
      }, {
          key: "_deviceIsClient",
          value: function _deviceIsClient(device) {
              if (device.equals(this.serverDevice || device.equals(this._thisDevice))) {
                  return false;
              }
              return this.devices.some(function (clientDevice) {
                  return device.equals(clientDevice);
              });
          }

          /**
           * Create a socket for the given server. A fake socket is used when using
           *  another devices IRC connection.
           * @param {string} server The name of the IRC server that the socket is
           *  connected to.
           */

      }, {
          key: "createSocket",
          value: function createSocket(server, port) {
              var socket;
              if (this.isClient()) {
                  socket = new RemoteSocket();
                  this._ircSocketMap[server] = socket;
              } else {
                  if (port && port.substr && port.substr(0, 1) === "+") socket = new SslSocket();else socket = new ChromeSocket();
                  this.broadcastSocketData(socket, server);
              }
              return socket;
          }
      }, {
          key: "broadcastUserInput",
          value: function broadcastUserInput(userInput) {
              var _this4 = this;

              return userInput.on("command", function (event) {
                  var name = event.name;
                  if (name !== "network-info" && name !== "join-server" && name !== "make-server" && name !== "about") {
                      return _this4._broadcast("user_input", event);
                  }
              });
          }
      }, {
          key: "broadcastSocketData",
          value: function broadcastSocketData(socket, server) {
              var _this5 = this;

              return socket.onAny(function (type, data) {
                  if (type === "data") {
                      data = new Uint8Array(data);
                  }
                  return _this5._broadcast("socket_data", server, type, data);
              });
          }
      }, {
          key: "_broadcast",
          value: function _broadcast(opt_blacklistedDevice, type) {
              for (var _len2 = arguments.length, rest = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                  rest[_key2 - 2] = arguments[_key2];
              }

              var blacklistedDevice;
              if (typeof opt_blacklistedDevice === "string") {
                  rest = [type].concat(babelHelpers.toConsumableArray(rest));
                  type = opt_blacklistedDevice;
                  blacklistedDevice = void 0;
              } else {
                  blacklistedDevice = opt_blacklistedDevice;
              }

              return this.devices.filter(function (device) {
                  return !device.equals(blacklistedDevice);
              }).map(function (device) {
                  return device.send(type, rest);
              });
          }
      }, {
          key: "disconnectDevices",
          value: function disconnectDevices() {
              this.devices.forEach(function (device) {
                  return device.close();
              });
              return this.becomeIdle();
          }
      }, {
          key: "waitForPort",
          value: function waitForPort(callback) {
              if (this.getState() === "found_port") {
                  return callback(true);
              }
              if (this.getState() === "no_port" || this.getState() === "no_addr") {
                  return callback(false);
              }
              if (this._thisDevice != null) {
                  this._thisDevice.once("found_port", function () {
                      return callback(true);
                  });
              }
              if (this._thisDevice != null) {
                  this._thisDevice.once("no_port", function () {
                      return callback(false);
                  });
              }
              return this.once("no_addr", function () {
                  return callback(false);
              });
          }
      }, {
          key: "becomeServer",
          value: function becomeServer() {
              if (this.isClient()) {
                  this.disconnectDevices();
              }
              this._type = "server";
              return this._state = "device_state";
          }
      }, {
          key: "becomeIdle",
          value: function becomeIdle() {
              this._type = "idle";
              return this._state = "device_state";
          }
      }, {
          key: "_becomeClient",
          value: function _becomeClient() {
              this._log("this device is now a client of", this.serverDevice.toString());
              this._type = "client";
              this._state = "connected";
              return this._addDevice(this.serverDevice);
          }
      }, {
          key: "disconnectFromServer",
          value: function disconnectFromServer() {
              var _ref;
              return (_ref = this.serverDevice) != null ? _ref.close() : void 0;
          }
          /**
           * Connect to a remote server. The IRC connection of the remote server will
           *  replace the local connection.
           * @params {{port: number, addr: string}} connectInfo
           */

      }, {
          key: "connectToServer",
          value: function connectToServer(connectInfo) {
              var _this6 = this;

              var device, deviceToClose;
              if (this._connectingTo) {
                  deviceToClose = this._connectingTo;
                  this._connectingTo = void 0;
                  deviceToClose.close();
              }
              this._state = "connecting";
              device = new RemoteDevice(connectInfo.addr, connectInfo.port);
              this._connectingTo = device;
              this._listenToDevice(device);
              return device.connect(function (success) {
                  if (success) {
                      return _this6._onConnectedToServer(device);
                  } else {
                      return _this6._onFailedToConnectToServer(device);
                  }
              });
          }
      }, {
          key: "_onConnectedToServer",
          value: function _onConnectedToServer(device) {
              var _this7 = this;

              this._log("connected to server", device.toString());
              return device.on("authentication_offer", function (device, password) {
                  device.password = password;
                  return _this7.emit("server_found", device);
              });
          }
      }, {
          key: "_onFailedToConnectToServer",
          value: function _onFailedToConnectToServer(device) {
              this._state = "device_state";
              return this.emit("invalid_server", device);
          }
      }, {
          key: "finalizeConnection",
          value: function finalizeConnection() {
              if (!this._connectingTo) {
                  return;
              }
              this._state = "connecting";
              return this._connectingTo.send("authenticate", [this._getAuthToken(this._connectingTo.password)]);
          }
      }, {
          key: "isServer",
          value: function isServer() {
              return this._type === "server";
          }
      }, {
          key: "isClient",
          value: function isClient() {
              return this._type === "client";
          }
      }, {
          key: "isIdle",
          value: function isIdle() {
              return this._type === "idle";
          }
      }, {
          key: "isInitializing",
          value: function isInitializing() {
              return this._type === void 0;
          }
      }]);
      return RemoteConnection;
  }(EventEmitter);

  /**
   * Utility class for determining the time between events.
   */

  var Timer = function () {
      function Timer() {
          babelHelpers.classCallCheck(this, Timer);
      }

      babelHelpers.createClass(Timer, [{
          key: "start",

          /**
           * Mark the start time of an event.
           * @param {string} name The name of the event.
           */
          value: function start(name) {
              return this._events[name] = {
                  startTime: this._getCurrentTime()
              };
          }

          /**
           * Destroy the event and return the elapsed time.
           * @param {string} name The name of the event.
           */

      }, {
          key: "finish",
          value: function finish(name) {
              var time = this.elapsed(name);
              delete this._events[name];
              return time;
          }

          /**
           * Returns the elapsed time..
           * @param {string} name The name of the event.
           */

      }, {
          key: "elapsed",
          value: function elapsed(name) {
              if (!this._events[name]) {
                  return 0;
              }
              return this._getCurrentTime() - this._events[name].startTime;
          }
      }, {
          key: "_getCurrentTime",
          value: function _getCurrentTime() {
              return new Date().getTime();
          }
      }]);
      return Timer;
  }();
  Timer.prototype._events = {};

  /**
   * Handles sharing an IRC connections between multiple devices.
   */

  var RemoteConnectionHandler = function () {
      function RemoteConnectionHandler(chat) {
          babelHelpers.classCallCheck(this, RemoteConnectionHandler);

          this._useOwnConnectionWhileWaitingForServer = this._useOwnConnectionWhileWaitingForServer.bind(this);
          this._reconnect = this._reconnect.bind(this);
          this._onOffline = this._onOffline.bind(this);
          this._onOnline = this._onOnline.bind(this);
          this._tearDown = this._tearDown.bind(this);

          this._log = getLogger(this);
          this._timer = new Timer();
          this._chat = chat;
          this._addConnectionChangeListeners();
          chat.on("tear_down", this._tearDown);
          if (!isOnline()) {
              this._chat.notice.prompt("No internet connection found. You will be unable to connect to IRC.");
          }
      }

      babelHelpers.createClass(RemoteConnectionHandler, [{
          key: "_tearDown",
          value: function _tearDown() {
              return this._removeConnectionChangeListeners();
          }
      }, {
          key: "_addConnectionChangeListeners",
          value: function _addConnectionChangeListeners() {
              $(window).on("online", this._onOnline);
              return $(window).on("offline", this._onOffline);
          }
      }, {
          key: "_removeConnectionChangeListeners",
          value: function _removeConnectionChangeListeners() {
              $(window).off("online", this._onOnline);
              return $(window).off("offline", this._onOffline);
          }

          /**
           * Set the storage handler which is used to store IRC states and which device
           *  is acting as the server
           * @param {Storage} storage
           */

      }, {
          key: "setStorageHandler",
          value: function setStorageHandler(storage) {
              var _this = this;

              this._storage = storage;
              this._remoteConnection.setIRCStateFetcher(function () {
                  return _this._storage.getState();
              });
              return this._remoteConnection.setChatLogFetcher(function () {
                  return _this._chat.messageHandler.getChatLog();
              });
          }

          /**
           * Set the remote connection which handles sending and receiving data from
           *  connected devices.
           * @param {RemoteConnection} remoteConnection
           */

      }, {
          key: "setRemoteConnection",
          value: function setRemoteConnection(remoteConnection) {
              this._remoteConnection = remoteConnection;
              return this._listenToRemoteConnectionEvents();
          }
      }, {
          key: "_onOnline",
          value: function _onOnline() {
              this._chat.notice.close();
              this._timer.start("started_connection");
              return this.determineConnection();
          }
      }, {
          key: "_onOffline",
          value: function _onOffline() {
              this._chat.notice.prompt("You lost connection to the internet. You will be unable to connect to IRC.");
              return this._chat.remoteConnection.disconnectDevices();
          }
      }, {
          key: "_listenToRemoteConnectionEvents",
          value: function _listenToRemoteConnectionEvents() {
              var _this2 = this;

              this._chat.userCommands.listenTo(this._remoteConnection);
              this._remoteConnection.on("found_addr", function () {
                  return _this2.determineConnection();
              });
              this._remoteConnection.on("no_addr", function () {
                  return _this2.useOwnConnection();
              });
              this._remoteConnection.on("no_port", function () {
                  return _this2.useOwnConnection();
              });
              this._remoteConnection.on("server_found", function () {
                  var abruptSwitch;
                  _this2._chat.notice.close();
                  abruptSwitch = _this2._timer.elapsed("started_connection") > RemoteConnectionHandler.NOTIFY_BEFORE_CONNECTING;
                  return abruptSwitch ? _this2._notifyConnectionAvailable() : _this2._remoteConnection.finalizeConnection();
              });
              this._remoteConnection.on("invalid_server", function (connectInfo) {
                  if (_this2._chat.remoteConnection.isInitializing()) {
                      _this2._onConnected = function () {
                          return _this2._displayFailedToConnect(connectInfo);
                      };
                  } else if (!_this2._reconnectionAttempt) {
                      _this2._displayFailedToConnect(connectInfo);
                  }
                  _this2._reconnectionAttempt = false;
                  _this2.useOwnConnection();
                  return _this2._tryToReconnectToServerDevice();
              });
              this._remoteConnection.on("irc_state", function (state) {
                  _this2._timer.start("started_connection");
                  _this2._reconnectionAttempt = false;
                  _this2._storage.pause();
                  _this2._chat.closeAllConnections();
                  _this2._stopServerReconnectAttempts();
                  return _this2._storage.loadState(state);
              });
              this._remoteConnection.on("chat_log", function (chatLog) {
                  var connInfo;
                  _this2._chat.messageHandler.replayChatLog(chatLog);
                  connInfo = _this2._remoteConnection.serverDevice;
                  if (!connInfo) return;
                  return _this2._chat.displayMessage("notice", _this2._chat.getCurrentContext(), "Connected through server device " + connInfo.toString());
              });
              this._remoteConnection.on("server_disconnected", function () {
                  _this2._timer.start("started_connection");
                  if (!_this2.manuallyDisconnected) {
                      _this2._onConnected = function () {
                          return _this2._displayLostConnectionMessage();
                      };
                  }
                  return _this2.determineConnection();
              });
              this._remoteConnection.on("client_joined", function (client) {
                  _this2._chat.displayMessage("notice", _this2._chat.getCurrentContext(), client.addr + " connected to this device");
                  return _this2._chat.updateStatus();
              });
              return this._remoteConnection.on("client_parted", function (client) {
                  _this2._chat.displayMessage("notice", _this2._chat.getCurrentContext(), client.addr + " disconnected from this device");
                  return _this2._chat.updateStatus();
              });
          }
      }, {
          key: "isManuallyConnecting",
          value: function isManuallyConnecting() {
              return this._timer.start("started_connection");
          }
      }, {
          key: "_notifyConnectionAvailable",
          value: function _notifyConnectionAvailable() {
              var _this3 = this;

              var message = "Device discovered. Would you like to connect and use its IRC connection? [connect]";
              return this._chat.notice.prompt(message, function () {
                  _this3._reconnectionAttempt = false;
                  return _this3._chat.remoteConnection.finalizeConnection();
              });
          }
      }, {
          key: "_displayFailedToConnect",
          value: function _displayFailedToConnect(connectInfo) {
              if (!connectInfo) return;
              return this._chat.displayMessage("notice", this._chat.getCurrentContext(), "Unable to connect to server device " + connectInfo.addr + " on port " + connectInfo.port);
          }
      }, {
          key: "_displayLostConnectionMessage",
          value: function _displayLostConnectionMessage() {
              return this._chat.displayMessage("notice", this._chat.getCurrentContext(), "Lost connection to server device. Attempting to reconnect...");
          }

          /**
           * Determine if we should connect directly to IRC or connect through another
           *  device's IRC connection.
           */

      }, {
          key: "determineConnection",
          value: function determineConnection() {
              if (!isOnline()) return;
              this._log("determining connection...", this._remoteConnection.getConnectionInfo().addr, this._storage.loadedServerDevice, this._storage.password);
              if (!(this._remoteConnection.getConnectionInfo().addr && this._storage.loadedServerDevice && this._storage.password)) return;
              this._log("can make a connection - device:", this._storage.serverDevice, "- is server?", this.shouldBeServerDevice());

              return this._storage.serverDevice && !this.shouldBeServerDevice() ? this._useServerDeviceConnection() : this.useOwnConnection();
          }
      }, {
          key: "_useServerDeviceConnection",
          value: function _useServerDeviceConnection() {
              clearTimeout(this._useOwnConnectionTimeout);
              if (this._alreadyConnectedToServerDevice()) return;
              this._log("automatically connecting to", this._storage.serverDevice);
              if (this._remoteConnection.isInitializing()) {
                  this._useOwnConnectionIfServerTakesTooLong();
              }
              return this._remoteConnection.connectToServer(this._storage.serverDevice);
          }
      }, {
          key: "_alreadyConnectedToServerDevice",
          value: function _alreadyConnectedToServerDevice() {
              var serverDevice = this._remoteConnection.serverDevice,
                  status = this._remoteConnection.getState(),
                  usingServerDeviceConnection = status === "connected" || status === "connecting",
                  isCurrentServerDevice = serverDevice != null ? serverDevice.usesConnection(this._storage.serverDevice) : void 0;
              return usingServerDeviceConnection && isCurrentServerDevice;
          }
      }, {
          key: "_useOwnConnectionIfServerTakesTooLong",
          value: function _useOwnConnectionIfServerTakesTooLong() {
              var _this4 = this;

              return this._useOwnConnectionTimeout = setTimeout(function () {
                  return _this4._useOwnConnectionWhileWaitingForServer();
              }, RemoteConnectionHandler.SERVER_DEVICE_CONNECTION_WAIT);
          }
      }, {
          key: "_tryToReconnectToServerDevice",
          value: function _tryToReconnectToServerDevice() {
              var _this5 = this;

              clearTimeout(this._serverDeviceReconnectTimeout);
              if (this._serverDeviceReconnectBackoff == null) {
                  this._serverDeviceReconnectBackoff = RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_WAIT;
              }
              return this._serverDeviceReconnectTimeout = setTimeout(function () {
                  return _this5._reconnect();
              }, this._serverDeviceReconnectBackoff);
          }
      }, {
          key: "_reconnect",
          value: function _reconnect() {
              var status = this._remoteConnection.getState();
              this._reconnectionAttempt = true;
              this._serverDeviceReconnectBackoff *= 1.2;
              if (this._serverDeviceReconnectBackoff > RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_MAX_WAIT) {
                  this._serverDeviceReconnectBackoff = RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_MAX_WAIT;
              }
              if (!(status === "connecting" || status === "connected")) {
                  return this.determineConnection();
              }
          }
      }, {
          key: "_stopServerReconnectAttempts",
          value: function _stopServerReconnectAttempts() {
              clearTimeout(this._serverDeviceReconnectTimeout);
              return this._serverDeviceReconnectBackoff = RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_WAIT;
          }
      }, {
          key: "_useOwnConnectionWhileWaitingForServer",
          value: function _useOwnConnectionWhileWaitingForServer() {
              var _this6 = this;

              var connectInfo;
              if (!this._remoteConnection.isInitializing()) return;
              this._remoteConnection.becomeIdle();
              connectInfo = this._storage.serverDevice;
              this._onConnected = function () {
                  return _this6._displayFailedToConnect(connectInfo);
              };
              return this._resumeIRCConnection();
          }
      }, {
          key: "useOwnConnection",
          value: function useOwnConnection() {
              var shouldResumeIRCConn, usingServerDeviceConnection;
              clearTimeout(this._useOwnConnectionTimeout);
              usingServerDeviceConnection = this._remoteConnection.getState() === "connected";
              if (usingServerDeviceConnection) {
                  this.manuallyDisconnected = true;
                  this._remoteConnection.disconnectFromServer();
                  this.manuallyDisconnected = false;
                  return;
              }
              if (this.shouldBeServerDevice()) {
                  this._chat.notice.close();
                  this._stopServerReconnectAttempts();
                  this._tryToBecomeServerDevice();
                  return;
              }
              shouldResumeIRCConn = this._notUsingOwnIRCConnection();
              if (this._remoteConnection.isIdle()) {
                  return;
              }
              this._stopBeingServerDevice();
              if (shouldResumeIRCConn) {
                  return this._resumeIRCConnection();
              }
          }
      }, {
          key: "_tryToBecomeServerDevice",
          value: function _tryToBecomeServerDevice() {
              var _this7 = this;

              var shouldResumeIRCConn;
              shouldResumeIRCConn = this._notUsingOwnIRCConnection();
              if (this._remoteConnection.getState() === "finding_port") {
                  this._remoteConnection.waitForPort(function () {
                      return _this7.determineConnection();
                  });
                  this._log("should be server, but havent found port yet...");
                  return;
              }
              if (this._remoteConnection.getState() === "no_port") {
                  if (this._remoteConnection.isServer()) {
                      this._stopBeingServerDevice();
                  }
              } else if (!this._remoteConnection.isServer() || this._storage.serverDevice.port !== this._remoteConnection.getConnectionInfo().port) {
                  this._becomeServerDevice();
              } else return;

              if (shouldResumeIRCConn) {
                  return this._resumeIRCConnection();
              }
          }
      }, {
          key: "_notUsingOwnIRCConnection",
          value: function _notUsingOwnIRCConnection() {
              return this._remoteConnection.isInitializing() || this._remoteConnection.isClient();
          }
      }, {
          key: "_stopBeingServerDevice",
          value: function _stopBeingServerDevice() {
              if (this._remoteConnection.isServer()) {
                  this._log("stopped being a server device");
                  return this._remoteConnection.disconnectDevices();
              } else {
                  return this._remoteConnection.becomeIdle();
              }
          }
      }, {
          key: "shouldBeServerDevice",
          value: function shouldBeServerDevice() {
              /**
               * TODO check something stored in local storage, not IP addr which can change
               */
              var _ref1, _ref2;
              return _ref1 = (_ref2 = this._storage.serverDevice) != null ? _ref2.addr : void 0, this._remoteConnection.getConnectionInfo().possibleAddrs.indexOf(_ref1) >= 0;
          }
      }, {
          key: "_becomeServerDevice",
          value: function _becomeServerDevice() {
              this._log("becoming server device");
              if (!this._remoteConnection.isInitializing()) {
                  this._chat.displayMessage("notice", this._chat.getCurrentContext(), "Now accepting connections from other devices");
              }
              this._remoteConnection.becomeServer();
              return this._storage.becomeServerDevice(this._remoteConnection.getConnectionInfo());
          }
      }, {
          key: "_resumeIRCConnection",
          value: function _resumeIRCConnection() {
              var _this8 = this;

              this._timer.start("started_connection");
              this._log("resuming IRC conn");
              this._chat.closeAllConnections();
              return this._storage.restoreSavedState(function () {
                  return _this8._onUsingOwnConnection();
              });
          }
      }, {
          key: "_onUsingOwnConnection",
          value: function _onUsingOwnConnection() {
              this._selectFirstRoom();
              this._chat.messageHandler.replayChatLog();
              this._storage.resume();
              if (typeof this._onConnected === "function") {
                  this._onConnected();
              }
              this._onConnected = void 0;
              if (!this._storage.completedWalkthrough) {
                  return this._chat.startWalkthrough();
              }
          }
      }, {
          key: "_selectFirstRoom",
          value: function _selectFirstRoom() {
              if (this._chat.winList.length > 1) {
                  return this._chat.switchToWindow(this._chat.winList.get(0));
              }
          }
      }]);
      return RemoteConnectionHandler;
  }();
  RemoteConnectionHandler.SERVER_DEVICE_CONNECTION_WAIT = 650;

  /**
   * If this many milliseconds go by after the user has connected to their own
   *  IRC connection, we will notify them before switching to a remote server
   *  connection.
   */
  RemoteConnectionHandler.NOTIFY_BEFORE_CONNECTING = 1500;

  /**
   * Number of ms to wait before trying to reconnect to the server device.
   */
  RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_WAIT = 500;
  RemoteConnectionHandler.SERVER_DEVICE_RECONNECTION_MAX_WAIT = 5 * 1000;

  /**
   * Chat Application Class
   */

  var Chat = function (_EventEmitter) {
      babelHelpers.inherits(Chat, _EventEmitter);

      function Chat() {
          babelHelpers.classCallCheck(this, Chat);

          // Binding Event Handlers to the instance

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Chat).call(this));

          _this.onMessageEvent = _this.onMessageEvent.bind(_this);
          _this.onServerEvent = _this.onServerEvent.bind(_this);
          _this.onIRCEvent = _this.onIRCEvent.bind(_this);

          var devCommands = new DeveloperCommands(_this);

          _this.connections = {};
          _this.messageHandler = new IRCMessageHandler(_this);
          _this.userCommands = new UserCommandHandler(_this);

          _this.userCommands.merge(devCommands);
          _this._initializeUI();
          _this._initializeRemoteConnection();
          _this._initializeStorage();
          _this._initializeScripts();
          _this._listenForUpdates();
          _this._keyboardShortcutMap = new KeyboardShortcutMap();
          _this.updateStatus();

          window.webkitRequestFileSystem(PERSISTENT, 50 * 1024, function (fileSystem) {
              fileSystem.root.getFile("custom_style.css", { create: false }, function (fileEntry) {
                  return $("#main-style").attr("href", fileEntry.toURL());
              });
          });
          return _this;
      }
      /**
       * Initialise the chat application
       */


      babelHelpers.createClass(Chat, [{
          key: "init",
          value: function init() {
              if (clientSocketSupported()) {
                  this.storage.init();
                  return this.remoteConnection.init();
              } else {
                  return this._displaySocketSupportError();
              }
          }
      }, {
          key: "getKeyboardShortcuts",
          value: function getKeyboardShortcuts() {
              return this._keyboardShortcutMap;
          }

          /**
           * Tell the user that they need chrome.sockets support to run CIRC.
           */

      }, {
          key: "_displaySocketSupportError",
          value: function _displaySocketSupportError() {
              var message = "CIRC cannot run on this device. Support for chrome.sockets is required to connect to the IRC server. Please update your version of Chrome and try again.";
              return this.displayMessage("error", this.getCurrentContext(), message);
          }
      }, {
          key: "tearDown",
          value: function tearDown() {
              return this.emit("tear_down");
          }
      }, {
          key: "_initializeUI",
          value: function _initializeUI() {
              var _this2 = this;

              this.winList = new WindowList();
              this.notice = new Notice();
              this.toggleChannelDisplay = $("#hide-channels");
              this.toggleChannelDisplay.click(function () {
                  $("#rooms-and-nicks")[0].classList.toggle("hidden");
              });
              this.channelDisplay = new ChannelList();
              this.channelDisplay.on("clicked", function (server, chan) {
                  var win = _this2.winList.get(server, chan);
                  if (win != null) return _this2.switchToWindow(win);
              });
              this.channelDisplay.on("midclicked", function (server, chan) {
                  _this2.disconnectAndRemoveRoom(server, chan);
              });
              this.channelDisplay.on("remove_button_clicked", function (server, chan) {
                  _this2.disconnectAndRemoveRoom(server, chan);
              });
              this.channelDisplay.on("help_type_command", function (text) {
                  _this2.emit("set_input", text);
                  _this2.emit("blink_input");
              });
              this._addWelcomeWindow();
          }
      }, {
          key: "_addWelcomeWindow",
          value: function _addWelcomeWindow() {
              this.emptyWindow = new Window("none");
              this.channelDisplay.addAlwaysEmptyServer(this.emptyWindow.name);
              this.switchToWindow(this.emptyWindow);
              return this.emptyWindow.messageRenderer.displayWelcome();
          }
      }, {
          key: "_initializeRemoteConnection",
          value: function _initializeRemoteConnection() {
              this.remoteConnection = new RemoteConnection();
              this.remoteConnectionHandler = new RemoteConnectionHandler(this);
              return this.remoteConnectionHandler.setRemoteConnection(this.remoteConnection);
          }
      }, {
          key: "_initializeStorage",
          value: function _initializeStorage() {
              this.storage = new Storage(this);
              return this.remoteConnectionHandler.setStorageHandler(this.storage);
          }

          /**
           * Load prepackaged scripts the first time the app is run. These scripts are
           *  loaded from storage on subsequent runs.
           */

      }, {
          key: "_initializeScripts",
          value: function _initializeScripts() {
              var _this3 = this;

              return this.storage.on("initialized", function () {
                  if (_this3.storage.loadedPrepackagedScripts) return;
                  ScriptLoader$1.loadPrepackagedScripts(function (script) {
                      return _this3.addScript(script);
                  });
                  return _this3.storage.finishedLoadingPrepackagedScripts();
              });
          }

          /**
           * Inform listeners (like ScriptHandler) that a script has been loaded and
           *  save the script to local storage.
           * @param {Script} script
           */

      }, {
          key: "addScript",
          value: function addScript(script) {
              this.scriptHandler.addScript(script);
              return this.storage.scriptAdded(script);
          }
      }, {
          key: "_listenForUpdates",
          value: function _listenForUpdates() {
              var _this4 = this;

              var onUpdateAvailable;
              if (chrome.runtime.reload === null) return;
              return (onUpdateAvailable = chrome.runtime.onUpdateAvailable) != null ? onUpdateAvailable.addListener(function () {
                  return _this4._promptToUpdate();
              }) : void 0;
          }
      }, {
          key: "_promptToUpdate",
          value: function _promptToUpdate() {
              var message = "A new version of CIRC is available. Would you like to restart and update? [update]";
              return this.notice.prompt(message, function () {
                  return chrome.runtime.reload();
              });
          }
      }, {
          key: "startWalkthrough",
          value: function startWalkthrough() {
              var _this5 = this;

              var walkthrough = new Walkthrough(this, this.storage);
              walkthrough.listenToIRCEvents(this._ircEvents);
              return walkthrough.on("tear_down", function () {
                  return _this5.storage.finishedWalkthrough();
              });
          }
      }, {
          key: "setPassword",
          value: function setPassword(password) {
              return this.remoteConnection.setPassword(password);
          }
      }, {
          key: "closeAllConnections",
          value: function closeAllConnections() {
              var _this6 = this;

              clearTimeout(this._useOwnConnectionTimeout);
              return iter(this.connections).values().each(function (connection) {
                  return _this6.closeConnection(connection);
              });
          }
      }, {
          key: "closeConnection",
          value: function closeConnection(conn, reason) {
              if (conn.irc.state === "reconnecting") {
                  conn.irc.giveup();
              } else {
                  conn.irc.quit(reason);
              }
              return this.removeWindow(this.winList.get(conn.name));
          }
      }, {
          key: "listenToCommands",
          value: function listenToCommands(commandEmitter) {
              this.remoteConnection.broadcastUserInput(commandEmitter);
              return this.userCommands.listenTo(commandEmitter);
          }
      }, {
          key: "listenToScriptEvents",
          value: function listenToScriptEvents(scriptHandler) {
              var _this7 = this;

              this.scriptHandler = scriptHandler;
              scriptHandler.on("save", function (id, item) {
                  return _this7.storage.saveItemForScript(id, item);
              });
              return scriptHandler.on("load", function (id, onLoaded) {
                  return _this7.storage.loadItemForScript(id, onLoaded);
              });
          }
      }, {
          key: "listenToIRCEvents",
          value: function listenToIRCEvents(ircEvents) {
              this._ircEvents = ircEvents;
              this._ircEvents.on("server", this.onIRCEvent);
              return this._ircEvents.on("message", this.onIRCEvent);
          }
      }, {
          key: "connect",
          value: function connect(server, port, password) {
              var irc;
              if (server in this.connections) {
                  irc = this.connections[server].irc.state;
                  /*
                   * TODO disconnect and reconnect if port changed
                   */
                  if (irc.state === "connected" || irc.state === "connecting") return;
              } else {
                  this._createConnection(server, port);
                  this._createWindowForServer(server, port, password);
              }
              return this.connections[server].irc.connect(server, port, password);
          }
      }, {
          key: "_createConnection",
          value: function _createConnection(server, port) {
              var irc = new IRC(this.remoteConnection.createSocket(server, port));
              if (this.preferredNick) {
                  irc.setPreferredNick(this.preferredNick);
              }
              if (this._ircEvents != null) {
                  this._ircEvents.addEventsFrom(irc);
              }
              return this.connections[server] = {
                  irc: irc,
                  name: server,
                  windows: {}
              };
          }
      }, {
          key: "_createWindowForServer",
          value: function _createWindowForServer(server, port, password) {
              var conn = this.connections[server],
                  win = this._makeWin(conn);

              this._replaceEmptyWindowIfExists(win);
              win.message("", "Connecting to " + conn.name + "...");
              this.channelDisplay.addServer(conn.name);
              this.storage.serverJoined(conn.name, port, password);
              return this.switchToWindow(win);
          }
      }, {
          key: "_replaceEmptyWindowIfExists",
          value: function _replaceEmptyWindowIfExists(win) {
              if (this.currentWindow.equals(this.emptyWindow)) {
                  this.channelDisplay.remove(this.emptyWindow.name);
                  return win.messageRenderer.displayWelcome();
              }
          }
      }, {
          key: "join",
          value: function join(conn, channel, opt_key) {
              var win;
              if (!conn.irc.isValidChannelPrefix(channel)) {
                  channel = "#" + channel;
              }
              win = this._createWindowForChannel(conn, channel);
              this.switchToWindow(win);
              this.storage.channelJoined(conn.name, channel, null, opt_key);
              return conn.irc.join(channel, opt_key);
          }
      }, {
          key: "setNick",
          value: function setNick(opt_server, nick) {
              var server;
              if (!nick) {
                  nick = opt_server;
                  server = void 0;
              } else {
                  server = opt_server;
              }
              this._setNickLocally(nick);
              this._tellServerNickChanged(nick, server);
              return this._emitNickChangedEvent(nick);
          }
      }, {
          key: "_setNickLocally",
          value: function _setNickLocally(nick) {
              this.preferredNick = nick;
              this.storage.nickChanged(nick);
              return this.updateStatus();
          }
      }, {
          key: "_tellServerNickChanged",
          value: function _tellServerNickChanged(nick, server) {
              var conn = this.connections[server];
              if (conn != null) {
                  conn.irc.doCommand("NICK", nick);
              }
              return conn != null ? conn.irc.setPreferredNick(nick) : void 0;
          }
      }, {
          key: "_emitNickChangedEvent",
          value: function _emitNickChangedEvent(nick) {
              var event;
              event = new Event$1("server", "nick", nick);
              event.setContext(this.getCurrentContext());
              return this.emit(event.type, event);
          }
      }, {
          key: "onIRCEvent",
          value: function onIRCEvent(e) {
              var conn = this.connections[e.context.server];
              if (e.type === "server") {
                  return this.onServerEvent(conn, e);
              } else {
                  return this.onMessageEvent(conn, e);
              }
          }
      }, {
          key: "onServerEvent",
          value: function onServerEvent(conn, e) {
              if (!conn) return;
              switch (e.name) {
                  case "connect":
                      return this.onConnected(conn);
                  case "disconnect":
                      return this.onDisconnected(conn);
                  case "joined":
                      return this.onJoined.apply(this, [conn, e.context.channel].concat(babelHelpers.toConsumableArray(e.args)));
                  case "names":
                      return this.onNames.apply(this, [e].concat(babelHelpers.toConsumableArray(e.args)));
                  case "parted":
                      return this.onParted(e);
                  case "nick":
                      return this.updateStatus();
              }
          }
      }, {
          key: "onMessageEvent",
          value: function onMessageEvent(conn, e) {
              var _messageHandler;

              var win = this.determineWindow(e);
              if (win === Chat.NO_WINDOW) return;
              this.messageHandler.setWindow(win);
              this.messageHandler.setCustomMessageStyle(e.style);
              return (_messageHandler = this.messageHandler).handle.apply(_messageHandler, [e.name].concat(babelHelpers.toConsumableArray(e.args)));
          }
          /**
           * Determine the window for which the event belongs.
           * @param {Event} e The event whose context we're looking at.
           */

      }, {
          key: "determineWindow",
          value: function determineWindow(e) {
              var chan,
                  conn = this.connections[e.context.server];
              if (!conn) return this.emptyWindow;
              if (e.context.channel === Chat.CURRENT_WINDOW && e.context.server !== getFieldOrNull(this.currentWindow, ["conn", "name"])) {
                  e.context.channel = Chat.SERVER_WINDOW;
              }
              chan = e.context.channel;
              if (this._isDirectMessageToUser(conn, chan, e.name)) {
                  var from = getFieldOrNull(e, ["args", 0]);
                  return this.createPrivateMessageWindow(conn, from);
              }
              if (!chan || chan === Chat.SERVER_WINDOW) {
                  return conn.serverWindow;
              }
              if (chan === Chat.CURRENT_WINDOW) {
                  return this.currentWindow;
              }
              if (conn.windows[chan.toLowerCase()]) {
                  return conn.windows[chan.toLowerCase()];
              }
              return Chat.NO_WINDOW;
          }

          /**
           * Direct messages (e.g. /msg) have the channel set to the user"s nick.
           */

      }, {
          key: "_isDirectMessageToUser",
          value: function _isDirectMessageToUser(conn, chan, type) {
              return (conn != null ? conn.irc.isOwnNick(chan) : void 0) && type === "privmsg";
          }
      }, {
          key: "createPrivateMessageWindow",
          value: function createPrivateMessageWindow(conn, from) {
              var win,
                  lowerCaseFrom = from.toLowerCase();

              if (conn.windows[lowerCaseFrom]) {
                  return conn.windows[lowerCaseFrom];
              }
              this.storage.channelJoined(conn.name, from, "private");
              win = conn.windows[lowerCaseFrom] = this._createWindowForChannel(conn, from);
              win.makePrivate();
              win.message("", "You're in a private conversation with " + from + ".", "notice");
              this.channelDisplay.connect(conn.name, from);
              return win;
          }
          /**
           * Keep track of the last person to mention the user"s nick in each room.
           * @param  {string} context
           * @param  {any} user
           */

      }, {
          key: "recordLastUserToMention",
          value: function recordLastUserToMention(context, user) {
              if (this._lastUsersToMention == null) {
                  this._lastUsersToMention = {};
              }
              return this._lastUsersToMention[context] = user;
          }
          /**
           * Returns the last person to mention the user"s nick for a given room.
           * @param  {string} context
           */

      }, {
          key: "getLastUserToMention",
          value: function getLastUserToMention(context) {
              return getFieldOrNull(this, ["_lastUsersToMention", context]);
          }
      }, {
          key: "onConnected",
          value: function onConnected(conn) {
              var _this8 = this;

              this.displayMessage("connect", {
                  server: conn.name
              });
              this.updateStatus();
              this.channelDisplay.connect(conn.name);

              return iter(conn.windows).pairs().each(function (_ref) {
                  var _ref2 = babelHelpers.slicedToArray(_ref, 2);

                  var channel = _ref2[0];
                  var win = _ref2[1];

                  _this8.displayMessage("connect", {
                      server: conn.name,
                      channel: win.target
                  });
                  if (win.isPrivate()) {
                      return _this8.channelDisplay.connect(conn.name, channel);
                  } else {
                      return void 0;
                  }
              });
          }
      }, {
          key: "onDisconnected",
          value: function onDisconnected(conn) {
              var _this9 = this;

              this.displayMessage("disconnect", {
                  server: conn.name
              });
              this.channelDisplay.disconnect(conn.name);

              return iter(conn.windows).pairs().each(function (_ref3) {
                  var _ref4 = babelHelpers.slicedToArray(_ref3, 2);

                  var channel = _ref4[0];
                  var window = _ref4[1];

                  _this9.channelDisplay.disconnect(conn.name, channel);
                  return _this9.displayMessage("disconnect", {
                      server: conn.name,
                      channel: window.target
                  });
              });
          }
      }, {
          key: "onJoined",
          value: function onJoined(conn, chan) {
              var win = this._createWindowForChannel(conn, chan);
              this.channelDisplay.connect(conn.name, chan);
              return win.nicks.clear();
          }
      }, {
          key: "_createWindowForChannel",
          value: function _createWindowForChannel(conn, chan) {
              var win = conn.windows[chan.toLowerCase()];
              if (!win) {
                  win = this._makeWin(conn, chan);
                  this.channelDisplay.insertChannel(this.winList.localIndexOf(win), conn.name, chan);
              }
              return win;
          }
      }, {
          key: "onNames",
          value: function onNames(e, nicks) {
              var win = this.determineWindow(e);
              if (win === Chat.NO_WINDOW) return;
              return nicks.map(function (nick) {
                  return win.nicks.add(nick);
              });
          }
      }, {
          key: "onParted",
          value: function onParted(e) {
              var win = this.determineWindow(e);
              if (win === Chat.NO_WINDOW) return;
              return this.channelDisplay.disconnect(win.conn.name, win.target);
          }
      }, {
          key: "disconnectAndRemoveRoom",
          value: function disconnectAndRemoveRoom(server, channel, opt_reason) {
              var win = this.winList.get(server, channel);
              if (win) {
                  if (!channel) {
                      this.closeConnection(win.conn, opt_reason);
                  } else {
                      if (!win.isPrivate()) {
                          win.conn.irc.part(channel, opt_reason);
                      }
                      this.removeWindow(win);
                  }
              }
          }
      }, {
          key: "removeWindow",
          value: function removeWindow(win) {
              var _this10 = this;

              var index, removedWindows;
              if (win == null) {
                  win = this.currentWindow;
              }
              index = this.winList.indexOf(win);
              if (win.isServerWindow()) {
                  if (this._ircEvents != null) {
                      this._ircEvents.removeEventsFrom(win.conn.irc);
                  }
              }
              removedWindows = this.winList.remove(win);
              removedWindows.forEach(function (window) {
                  return _this10._removeWindowFromState(window);
              });
              return this._selectNextWindow(index);
          }
      }, {
          key: "_removeWindowFromState",
          value: function _removeWindowFromState(win) {
              this.channelDisplay.remove(win.conn.name, win.target);
              this.storage.parted(win.conn.name, win.target);
              win.notifications.clear();
              if (win.target != null) {
                  delete this.connections[win.conn.name].windows[win.target];
              } else {
                  delete this.connections[win.conn.name];
              }
              return win.remove();
          }
      }, {
          key: "_selectNextWindow",
          value: function _selectNextWindow(preferredIndex) {
              if (this.winList.length === 0) {
                  this.channelDisplay.addAlwaysEmptyServer(this.emptyWindow.name);
                  return this.switchToWindow(this.emptyWindow);
              } else if (this.winList.indexOf(this.currentWindow) === -1) {
                  var windex = this.winList.get(preferredIndex);
                  var nextWin = windex != null ? windex : this.winList.get(preferredIndex - 1);
                  return this.switchToWindow(nextWin);
              } else {
                  return this.switchToWindow(this.currentWindow);
              }
          }
      }, {
          key: "_makeWin",
          value: function _makeWin(conn, opt_chan) {
              var _this11 = this;

              var channel = getFieldOrNull(conn.irc, ["channels", opt_chan, "channel"]) || opt_chan,
                  win = new Window(conn.name, channel);
              win.conn = conn;
              if (opt_chan) {
                  var ocLowerCase = opt_chan.toLowerCase();
                  conn.windows[ocLowerCase] = win;
                  win.setTarget(ocLowerCase);
                  win.nicks.on("dblclicked", function (nick) {
                      return _this11.switchToWindow(_this11.createPrivateMessageWindow(win.conn, nick));
                  });
              } else {
                  conn.serverWindow = win;
              }
              this.winList.add(win);
              this.messageHandler.logMessagesFromWindow(win);
              return win;
          }
      }, {
          key: "updateStatus",
          value: function updateStatus() {
              var away,
                  topic,
                  conn = this.currentWindow.conn,
                  nick = this.preferredNick;

              if (conn) {
                  var channelName = this.currentWindow.target,
                      channel = channelName ? this.currentWindow.conn.irc.channels[channelName] : undefined;

                  nick = this.currentWindow.conn.irc.nick || this.preferredNick;
                  away = this.currentWindow.conn.irc.away;
                  if (channel) topic = channel.topic;
              }

              $("#nick").html((nick ? "<span class=\"name\">" + html.escape(nick) + "</span>" : "") + (away ? "<span class=\"away\">away</span>" : ""));
              $("#status").html(topic ? "<span title=\"" + html.escape(topic) + "\" class=\"topic\">" + html.display(topic) + "</span>" : "");
              return this._updateDocumentTitle();
          }
      }, {
          key: "_updateDocumentTitle",
          value: function _updateDocumentTitle() {
              var connectedDevices,
                  remoteConnection = this.remoteConnection,
                  titleList = [];
              titleList.push("CIRC " + VERSION);

              if (remoteConnection) {
                  if (remoteConnection.isClient()) {
                      titleList.push("- Connected through " + this.remoteConnection.serverDevice.addr);
                  } else if (this.remoteConnection.isServer()) {
                      connectedDevices = this.remoteConnection.devices.length;
                      titleList.push("- Server for " + connectedDevices + " other " + pluralize("device", connectedDevices));
                  }
              }
              return document.title = titleList.join(" ");
          }
          /**
           * Switch to a window that represents a channel by its position in the rooms
           *  list.
           * @param  {any} winNum
           */

      }, {
          key: "switchToChannelByIndex",
          value: function switchToChannelByIndex(winNum) {
              var win = this.winList.getChannelWindow(winNum);
              if (win != null) {
                  return this.switchToWindow(win);
              }
          }
      }, {
          key: "switchToWindow",
          value: function switchToWindow(win) {
              if (win == null) throw new Error("switching to non-existant window");

              if (this.currentWindow) this.currentWindow.detach();

              this.currentWindow = win;
              win.attach();
              this._focusInput();
              this._selectWindowInChannelDisplay(win);
              return this.updateStatus();
          }
      }, {
          key: "_focusInput",
          value: function _focusInput() {
              var input = $("#input");
              if (input) setTimeout(function () {
                  return input.focus();
              }, 0);
          }
      }, {
          key: "_selectWindowInChannelDisplay",
          value: function _selectWindowInChannelDisplay(win) {
              if (win.conn) {
                  return this.channelDisplay.select(win.conn.name, win.target);
              } else {
                  return this.channelDisplay.select(win.name);
              }
          }
          /**
           * Emits a message to the script handler, which decides if it should send it back
           */

      }, {
          key: "displayMessage",
          value: function displayMessage(name, context) {
              for (var _len = arguments.length, rest = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                  rest[_key - 2] = arguments[_key];
              }

              var event = new (Function.prototype.bind.apply(Event$1, [null].concat(["message", name], rest)))();
              event.setContext(context.server, context.channel);
              return this.emit(event.type, event);
          }
      }, {
          key: "getCurrentContext",
          value: function getCurrentContext() {
              return new Context(getFieldOrNull(this.currentWindow.conn, ["name"]), Chat.CURRENT_WINDOW);
          }
      }]);
      return Chat;
  }(EventEmitter);

  Chat.SERVER_WINDOW = "@server_window";
  Chat.CURRENT_WINDOW = "@current_window";
  Chat.NO_WINDOW = "NO_WINDOW";

  /**
   * A traversable stack of all input entered by the user.
   */

  var InputStack = function () {
      function InputStack() {
          babelHelpers.classCallCheck(this, InputStack);

          this._previousInputs = [""];
          this._previousInputIndex = 0;
      }
      /**
       * Keeps track of the unentered input that was present when the user
       * began traversing the stack.
       * @param {string} text
       */


      babelHelpers.createClass(InputStack, [{
          key: "setCurrentText",
          value: function setCurrentText(text) {
              if (this._previousInputIndex === 0) {
                  return this._previousInputs[0] = text;
              }
          }
      }, {
          key: "showPreviousInput",
          value: function showPreviousInput() {
              if (!(this._previousInputIndex >= this._previousInputs.length - 1)) {
                  this._previousInputIndex++;
                  return this._previousInputs[this._previousInputIndex];
              }
              return void 0;
          }
      }, {
          key: "showNextInput",
          value: function showNextInput() {
              if (!(this._previousInputIndex <= 0)) {
                  this._previousInputIndex--;
                  return this._previousInputs[this._previousInputIndex];
              }
              return void 0;
          }

          /**
           * Restarts the traversal position. Should be called when the user begins
           *  typing a new command.
           */

      }, {
          key: "reset",
          value: function reset() {
              return this._previousInputIndex = 0;
          }

          /**
           * Add input to the stack.
           * @param {string} input
           */

      }, {
          key: "addInput",
          value: function addInput(input) {
              return this._previousInputs.splice(1, 0, input);
          }
      }]);
      return InputStack;
  }();

  /**
   * Finds completions for a partial word.
   * Completion candidates can be set using setCompletions() or by specifying a
   *  completion generator function.
   */

  var CompletionFinder = function () {
      /**
       * Create a new completion finder and optionally set a callback that can be
       *  used to retrieve completion candidates.
       * @param {function:string[]} opt_getCompletionsCallback
       */

      function CompletionFinder(opt_getCompletionsCallback) {
          babelHelpers.classCallCheck(this, CompletionFinder);

          this._completions = [];
          this._getCompletions = opt_getCompletionsCallback;
          this.reset();
      }
      /**
       * Set a callback that can be used to retrieve completion candidates.
       * @param {function:string[]} completionGenerator
       */


      babelHelpers.createClass(CompletionFinder, [{
          key: "setCompletionGenerator",
          value: function setCompletionGenerator(completionGenerator) {
              return this._getCompletions = completionGenerator;
          }
          /**
           * Clear stored completion candidates.
           */

      }, {
          key: "clearCompletions",
          value: function clearCompletions() {
              return this._completions = [];
          }
          /**
           * Add completion candidates.
           * @param {string[]} completions
           */

      }, {
          key: "addCompletions",
          value: function addCompletions(completions) {
              return this._completions = this._completions.concat(completions);
          }
      }, {
          key: "setCompletions",
          value: function setCompletions(completions) {
              this.clearCompletions();
              return this.addCompletions(completions);
          }
          /**
           * Get a completion for the current stub.
           * The stub only needs to be passed in the first time getCompletion() is
           *  called or after reset() is called.
           * @param {string} opt_stub The partial word to auto-complete.
           */

      }, {
          key: "getCompletion",
          value: function getCompletion(opt_stub) {
              if (!this.hasStarted) {
                  this._generateCompletions();
                  this._currentStub = opt_stub;
                  this._findCompletions();
                  this.hasStarted = true;
              }
              return this._getNextCompletion();
          }
          /**
           * Add completions from the completion generator, if set.
           */

      }, {
          key: "_generateCompletions",
          value: function _generateCompletions() {
              if (this._getCompletions != null) {
                  return this.setCompletions(this._getCompletions());
              }
          }
          /**
           * Create a list of all possible completions for the current stub.
           */

      }, {
          key: "_findCompletions",
          value: function _findCompletions() {
              var _this = this;

              var ignoreCase = !/[A-Z]/.test(this._currentStub);

              return this._currentCompletions = this._completions.filter(function (completion) {
                  var text = ignoreCase ? completion.toString().toLowerCase() : completion.toString();
                  return text.indexOf(_this._currentStub) === 0;
              });
          }
          /**
           * Get the next completion, or NONE if no completions are found.
           * Completions are returned by iterating through the list of possible
           *  completions.
           * @returns {string|NONE}
           */

      }, {
          key: "_getNextCompletion",
          value: function _getNextCompletion() {
              var result;
              if (this._currentCompletions.length === 0) {
                  return CompletionFinder.NONE;
              }
              result = this._currentCompletions[this._completionIndex];
              this._completionIndex++;
              if (this._completionIndex >= this._currentCompletions.length) {
                  this._completionIndex = 0;
              }
              return result;
          }
          /**
           * Reset the current stub and clear the list of possible completions.
           * The current stub will be set again the next time getCompletion() is called.
           */

      }, {
          key: "reset",
          value: function reset() {
              this._currentCompletions = [];
              this._completionIndex = 0;
              this.currentStub = "";
              return this.hasStarted = false;
          }
      }]);
      return CompletionFinder;
  }();

  CompletionFinder.NONE = void 0;

  /**
   * Simple storage class for completions which stores the completion text
   *  and type of completion.
   */

  var Completion = function () {
      /**
       * @param  {string} text
       * @param  {number} type
       */

      function Completion(text, type) {
          babelHelpers.classCallCheck(this, Completion);

          this._text = text;
          this._type = type;
          if (this._type === Completion.CMD) {
              this._text = "/" + this._text;
          }
      }

      babelHelpers.createClass(Completion, [{
          key: "getText",
          value: function getText() {
              return this._text;
          }
      }, {
          key: "getType",
          value: function getType() {
              return this._type;
          }
      }, {
          key: "getSuffix",
          value: function getSuffix(preCompletionLength) {
              if (this._type === Completion.NICK && preCompletionLength === 0) {
                  return Completion.COMPLETION_SUFFIX + " ";
              }
              return " ";
          }
      }, {
          key: "toString",
          value: function toString() {
              return this.getText();
          }
      }]);
      return Completion;
  }();
  /**
   * Completions can either be commands or nicks.
   */


  Completion.CMD = 0;
  Completion.NICK = 1;
  Completion.COMPLETION_SUFFIX = ":";

  /**
   * Takes a string and replaces a word with its completion based on the cursor position.
   * Currently only supports completion of nicks in the current window.
   */

  var AutoComplete = function () {
      function AutoComplete() {
          babelHelpers.classCallCheck(this, AutoComplete);

          this._getPossibleCompletions = this._getPossibleCompletions.bind(this);
          this._completionFinder = new CompletionFinder();
      }
      /**
       * Set the context from which the list of nicks can be generated.
       * @param {{currentWindow: {target: string, conn: Object}}} context
       */


      babelHelpers.createClass(AutoComplete, [{
          key: "setContext",
          value: function setContext(context) {
              this._context = context;
              return this._completionFinder.setCompletionGenerator(this._getPossibleCompletions);
          }

          /**
           * Returns a list of possible auto-completions in the current channel.
           * @return {Array.<Completion>}
           */

      }, {
          key: "_getPossibleCompletions",
          value: function _getPossibleCompletions() {
              return this._getCommandCompletions().concat(this._getNickCompletions());
          }

          /**
           * Returns a sorted list of visible commands.
           * @return {Array<Completion>}
           */

      }, {
          key: "_getCommandCompletions",
          value: function _getCommandCompletions() {
              return iter(this._context.userCommands.getCommands()).values().filter(function (command) {
                  return command.category !== "hidden";
              }).sort().map(function (command) {
                  return new Completion(command, Completion.CMD);
              });
          }

          /**
           * Returns a list of nicks in the current channel.
           * @return {Array.<Completion>}
           */

      }, {
          key: "_getNickCompletions",
          value: function _getNickCompletions() {
              var irc = this._context.currentWindow.conn.irc,
                  chan = this._context.currentWindow.target,
                  nicks = getFieldOrNull(irc, ["channels", chan, "names"]);
              if (nicks != null) {
                  return iter(nicks).values().map(function (nick) {
                      return new Completion(nick, Completion.NICK);
                  });
              }
              return [];
          }

          /**
           * Returns the passed in text, with the current stub replaced with its
           *  completion.
           * @param {string} text The text the user has input.
           * @param {number} cursor The current position of the cursor.
           */

      }, {
          key: "getTextWithCompletion",
          value: function getTextWithCompletion(text, cursor) {
              var completion, textWithCompletion;
              this._text = text;
              this._cursor = cursor;
              if (this._previousText !== this._text) {
                  this._completionFinder.reset();
              }
              this._previousCursor = this._cursor;
              if (!this._completionFinder.hasStarted) {
                  this._extractStub();
              }
              completion = this._getCompletion();
              textWithCompletion = this._preCompletion + completion + this._postCompletion;
              this._updatedCursorPosition = this._preCompletion.length + completion.length;
              this._previousText = textWithCompletion;
              return textWithCompletion;
          }
      }, {
          key: "getUpdatedCursorPosition",
          value: function getUpdatedCursorPosition() {
              return this._updatedCursorPosition || 0;
          }

          /**
           * Returns the completion for the current stub with the completion suffix and
           *  or space after.
           */

      }, {
          key: "_getCompletion",
          value: function _getCompletion() {
              var completion = this._completionFinder.getCompletion(this._stub);
              if (completion === CompletionFinder.NONE) {
                  return this._stub;
              }
              return completion.getText() + completion.getSuffix(this._preCompletion.length);
          }

          /**
           * Finds the stub by looking at the cursor position, then finds the text before
           *  and after the stub.
           */

      }, {
          key: "_extractStub",
          value: function _extractStub() {
              var preStubEnd, stubEnd;
              stubEnd = this._findNearest(this._cursor - 1, /\S/);
              if (stubEnd < 0) {
                  stubEnd = 0;
              }
              preStubEnd = this._findNearest(stubEnd, /\s/);
              this._preCompletion = this._text.slice(0, preStubEnd + 1);
              this._stub = this._text.slice(preStubEnd + 1, +stubEnd + 1 || 9e9);
              return this._postCompletion = this._text.slice(stubEnd + 1);
          }

          /**
           * Searches backwards until the regex matches the current character.
           * @return {number} The position of the matched character or -1 if not found.
           */

      }, {
          key: "_findNearest",
          value: function _findNearest(start, regex) {
              var i, _i;
              for (i = _i = start; start <= 0 ? _i <= 0 : _i >= 0; i = start <= 0 ? ++_i : --_i) {
                  if (regex.test(this._text[i])) {
                      return i;
                  }
              }
              return -1;
          }
      }]);
      return AutoComplete;
  }();

  AutoComplete.COMPLETION_SUFFIX = ":";

  /**
   * Manages keyboard and hotkey input from the user, including autocomplete and
   * traversing through previous commands.
   */

  var UserInputHander = function (_EventEmitter) {
      babelHelpers.inherits(UserInputHander, _EventEmitter);

      /**
       * Initialise the User Input
       * @param  {jQueryElement} input
       * @param  {jQueryWindow} window
       */

      function UserInputHander(input, window) {
          babelHelpers.classCallCheck(this, UserInputHander);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(UserInputHander).call(this));

          _this.input = input;
          _this.window = window;
          // Binding Event Handlers and methods to the instance
          _this._sendUserCommand = _this._sendUserCommand.bind(_this);
          _this._handleKeydown = _this._handleKeydown.bind(_this);
          _this._handleGlobalKeydown = _this._handleGlobalKeydown.bind(_this);

          _this.input.focus();
          _this._inputStack = new InputStack();
          _this._autoComplete = new AutoComplete();
          _this.input.keydown(_this._handleKeydown);
          _this.window.keydown(_this._handleGlobalKeydown);
          return _this;
      }

      babelHelpers.createClass(UserInputHander, [{
          key: "setContext",
          value: function setContext(context) {
              var _this2 = this;

              this._context = context;
              this._autoComplete.setContext(this._context);
              this._context.on("set_input_if_empty", function (text) {
                  if (!_this2.input.val()) {
                      _this2.setInput(text);
                  }
              });
              this._context.on("set_input", function (text) {
                  return _this2.setInput(text);
              });
              this._context.on("blink_input", function () {
                  _this2.input.css("-webkit-transition", "0");
                  _this2.input.addClass("blink");
                  setTimeout(function () {
                      _this2.input.css("-webkit-transition", "300ms");
                      _this2.input.removeClass("blink");
                  }, 0);
              });
          }
      }, {
          key: "setInput",
          value: function setInput(text) {
              var _this3 = this;

              this.input.val(text);
              // If setInput was called because of a click, we need to wait for the
              // click to propagate before setting focus.
              setTimeout(function () {
                  return _this3.input.focus();
              }, 0);
          }
      }, {
          key: "setKeyboardShortcuts",
          value: function setKeyboardShortcuts(keyboardShortcuts) {
              return this._keyboardShortcutMap = keyboardShortcuts;
          }
      }, {
          key: "_handleGlobalKeydown",
          value: function _handleGlobalKeydown(e) {
              this.text = this.input.val();
              this._focusInputOnKeyPress(e);
              this._handleKeyboardShortcuts(e);
              if (e.isDefaultPrevented()) {
                  return false;
              }
              this._showPreviousCommandsOnArrowKeys(e);
              this._autoCompleteOnTab(e);
              return !e.isDefaultPrevented();
          }
      }, {
          key: "_focusInputOnKeyPress",
          value: function _focusInputOnKeyPress(e) {
              if (!(e.metaKey || e.ctrlKey)) {
                  e.currentTarget = this.input[0];
                  return this.input.focus();
              }
          }
      }, {
          key: "_handleKeyboardShortcuts",
          value: function _handleKeyboardShortcuts(e) {
              var event;

              var _keyboardShortcutMap$ = this._keyboardShortcutMap.getMappedCommand(e, this.input.val());

              var _keyboardShortcutMap$2 = babelHelpers.slicedToArray(_keyboardShortcutMap$, 2);

              var command = _keyboardShortcutMap$2[0];
              var args = _keyboardShortcutMap$2[1];


              if (!command) {
                  return;
              }
              e.preventDefault();
              event = new (Function.prototype.bind.apply(Event$1, [null].concat(["command", command], babelHelpers.toConsumableArray(args))))();
              return this._emitEventToCurrentWindow(event);
          }
      }, {
          key: "_showPreviousCommandsOnArrowKeys",
          value: function _showPreviousCommandsOnArrowKeys(e) {
              if (e.which === keyCodes.toKeyCode("UP") || e.which === keyCodes.toKeyCode("DOWN")) {
                  var input = void 0;
                  e.preventDefault();
                  if (e.which === keyCodes.toKeyCode("UP")) {
                      this._inputStack.setCurrentText(this.text);
                      input = this._inputStack.showPreviousInput();
                  } else {
                      input = this._inputStack.showNextInput();
                  }
                  if (input != null) {
                      return this.input.val(input);
                  }
              } else {
                  return this._inputStack.reset();
              }
          }
      }, {
          key: "_autoCompleteOnTab",
          value: function _autoCompleteOnTab(e) {
              if (e.which === keyCodes.toKeyCode("TAB")) {
                  e.preventDefault();
                  if (this.text) {
                      var textWithCompletion = this._autoComplete.getTextWithCompletion(this.text, this._getCursorPosition());
                      this.input.val(textWithCompletion);
                      return this._setCursorPosition(this._autoComplete.getUpdatedCursorPosition());
                  }
              }
          }
      }, {
          key: "_setCursorPosition",
          value: function _setCursorPosition(pos) {
              return this.input[0].setSelectionRange(pos, pos);
          }
      }, {
          key: "_getCursorPosition",
          value: function _getCursorPosition() {
              return this.input[0].selectionStart;
          }
      }, {
          key: "_handleKeydown",
          value: function _handleKeydown(e) {
              this.text = this.input.val();
              if (e.which === keyCodes.toKeyCode("ENTER")) {
                  if (this.text.length > 0) {
                      this.input.val("");
                      this._sendUserCommand();
                  }
              }
              return true;
          }
          /**
           * Wrap the input in an event and emit it.
           */

      }, {
          key: "_sendUserCommand",
          value: function _sendUserCommand() {
              var event, name, words;
              this._inputStack.addInput(this.text);
              words = this.text.split(/\s/);
              if (this.text[0] === "/") {
                  name = words[0].slice(1).toLowerCase();
                  words = words.slice(1);
              } else {
                  name = "say";
              }
              event = new (Function.prototype.bind.apply(Event$1, [null].concat(["command", name], babelHelpers.toConsumableArray(words))))();
              return this._emitEventToCurrentWindow(event);
          }
      }, {
          key: "_emitEventToCurrentWindow",
          value: function _emitEventToCurrentWindow(event) {
              event.context = this._context.currentWindow.getContext();
              return this.emit(event.type, event);
          }
      }]);
      return UserInputHander;
  }(EventEmitter);

  /**
   * Handles currently running scripts. Events sent from the user and IRC servers
   *  are intercepted by this class, passed to scripts, and then forwarded on to
   *  their destination.
   */

  var ScriptHandler = function (_EventEmitter) {
      babelHelpers.inherits(ScriptHandler, _EventEmitter);

      function ScriptHandler() {
          babelHelpers.classCallCheck(this, ScriptHandler);

          var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(ScriptHandler).call(this));

          _this._handleMessage = _this._handleMessage.bind(_this);
          _this._handleEvent = _this._handleEvent.bind(_this);

          _this._scripts = {};
          _this._pendingEvents = Object.create(null);
          _this._eventCount = 0;
          _this._emitters = [];
          _this._propagationTimeoutTimerId = null;
          _this._log = getLogger(_this);
          addEventListener("message", _this._handleMessage);
          return _this;
      }

      babelHelpers.createClass(ScriptHandler, [{
          key: "listenToScriptEvents",
          value: function listenToScriptEvents(emitter) {
              return emitter.on("script_loaded", this.addScript);
          }

          /**
           * Add a script to the list of currently active scripts. Once added, the script
           *  will receive events from the user and IRC server.
           * @param {Script} script
           */

      }, {
          key: "addScript",
          value: function addScript(script) {
              return this._scripts[script.id] = script;
          }

          /**
           * Remove a script to the list of currently active scripts. Once removed,
           * the script will not longer receive events from the user or IRC server.
           * @param {Script} script
           */

      }, {
          key: "removeScript",
          value: function removeScript(script) {
              var _this2 = this;

              this._getPendingEventsForScript(script).each(function (eventID) {
                  return _this2._stopHandlingEvent(script, eventID);
              });

              return delete this._scripts[script.id];
          }
          /**
           * @param  {Script} script
           * @return {Sequence}
           */

      }, {
          key: "_getPendingEventsForScript",
          value: function _getPendingEventsForScript(script) {
              return iter(this._pendingEvents).values().filter(function (pendingEvent) {
                  return !pendingEvent.scripts.some(function (pendingScript) {
                      return pendingScript.id === script.id;
                  });
              }).map(function (_ref) {
                  var id = _ref.id;
                  return id;
              });
          }
      }, {
          key: "on",
          value: function on(ev, cb) {
              if (ScriptHandler.HOOKABLE_EVENTS.indexOf(ev) >= 0 || ScriptHandler.SCRIPTING_EVENTS.indexOf(ev) >= 0) {
                  return babelHelpers.get(Object.getPrototypeOf(ScriptHandler.prototype), "on", this).call(this, ev, cb);
              } else {
                  return this._forwardEvent(ev, cb);
              }
          }
      }, {
          key: "_forwardEvent",
          value: function _forwardEvent(ev, cb) {
              return this._emitters.map(function (emitter) {
                  return emitter.on(ev, cb);
              });
          }
      }, {
          key: "addEventsFrom",
          value: function addEventsFrom(emitter) {
              var _this3 = this;

              this._emitters.push(emitter);
              return ScriptHandler.HOOKABLE_EVENTS.map(function (event) {
                  return emitter.on(event, _this3._handleEvent);
              });
          }
      }, {
          key: "removeEventsFrom",
          value: function removeEventsFrom(emitter) {
              var _this4 = this;

              this._emitters.splice(this._emitters.indexOf(emitter), 1);
              return ScriptHandler.HOOKABLE_EVENTS.map(function (event) {
                  return emitter.removeListener(event, _this4._handleEvent);
              });
          }
      }, {
          key: "_handleEvent",
          value: function _handleEvent(event) {
              event.id = this._eventCount++;
              if (this._eventCanBeForwarded(event)) {
                  this._offerEventToScripts(event);
              }
              if (!this._eventIsBeingHandled(event.id)) {
                  return this._emitEvent(event);
              }
          }

          /**
           * Certain events are not allowed to be intercepted by scripts for security reasons.
           * @param {Event} event
           * @return {boolean} Returns true if the event can be forwarded to scripts.
           */

      }, {
          key: "_eventCanBeForwarded",
          value: function _eventCanBeForwarded(event) {
              return !(event.hook in ScriptHandler.UNINTERCEPTABLE_EVENTS);
          }
      }, {
          key: "_offerEventToScripts",
          value: function _offerEventToScripts(event) {
              var _this5 = this;

              return iter(this._scripts).values().filter(function (script) {
                  return script.shouldHandle(event);
              }).each(function (script) {
                  return _this5._sendEventToScript(event, script);
              });
          }
      }, {
          key: "_sendEventToScript",
          value: function _sendEventToScript(event, script) {
              script.postMessage(event);
              this._markEventAsPending(event, script);
              if (!this._propagationTimeoutTimerId) {
                  this._propagationTimeoutTimerId = setTimeout(this._checkPropagationTimeout.bind(this), ScriptHandler.PROPAGATION_TIMEOUT);
              }
          }
      }, {
          key: "_markEventAsPending",
          value: function _markEventAsPending(event, script) {
              if (!this._pendingEvents[event.id]) {
                  this._pendingEvents[event.id] = {};
                  this._pendingEvents[event.id].event = event;
                  this._pendingEvents[event.id].scripts = [];
                  this._pendingEvents[event.id].timestamp = Date.now();
              }
              return this._pendingEvents[event.id].scripts.push(script);
          }
      }, {
          key: "_checkPropagationTimeout",
          value: function _checkPropagationTimeout() {
              var _this6 = this;

              iter(this._getUnresponsiveScripts()).values().each(function (script) {
                  _this6._log("e", "Removing unresponsive script " + script.getName());
                  _this6.removeScript(script);
              });
              this._propagationTimeoutTimerId = null;
              if (!this._isPendingEventQueueEmpty()) {
                  this._propagationTimeoutTimerId = setTimeout(this._checkPropagationTimeout.bind(this), this._getNextPendingEventTimeout());
              }
          }
      }, {
          key: "_getUnresponsiveScripts",
          value: function _getUnresponsiveScripts() {
              var now = Date.now();

              return iter(this._pendingEvents).values().filter(function (pendingEvent) {
                  return pendingEvent.timestamp + ScriptHandler.PROPAGATION_TIMEOUT <= now;
              }).map(function (pendingEvent) {
                  return pendingEvent.scripts;
              }).flatten().indexBy("id").toObject();
          }
      }, {
          key: "_isPendingEventQueueEmpty",
          value: function _isPendingEventQueueEmpty() {
              for (var id in this._pendingEvents) {
                  id;
                  return false;
              }
              return true;
          }
      }, {
          key: "_getNextPendingEventTimeout",
          value: function _getNextPendingEventTimeout() {
              var smallestTimestamp = iter(this._pendingEvents).values().reduce(function (smallest, pendingEvent) {
                  return pendingEvent.timestamp < smallest ? pendingEvent.timestamp : smallest;
              }, Number.MAX_VALUE);

              var nextTimeout = smallestTimestamp + ScriptHandler.PROPAGATION_TIMEOUT - Date.now();
              if (nextTimeout > ScriptHandler.PROPAGATION_TIMEOUT || nextTimeout <= 0) {
                  nextTimeout = ScriptHandler.PROPAGATION_TIMEOUT;
              }
              return nextTimeout;
          }
      }, {
          key: "_eventIsBeingHandled",
          value: function _eventIsBeingHandled(eventId) {
              if (!(eventId in this._pendingEvents)) {
                  return false;
              }
              return this._pendingEvents[eventId].scripts.length > 0;
          }
      }, {
          key: "_handleMessage",
          value: function _handleMessage(message) {
              var type,
                  event = message.data,
                  script = Script.getScriptFromFrame(this._scripts, message.source);

              if (script == null) return;

              switch (event.type) {
                  case "hook_command":
                  case "hook_server":
                  case "hook_message":
                      type = event.type.slice(5);
                      return script.beginHandlingType(type, event.name);
                  case "command":
                  case "sevrer":
                  case "message":
                      return this._emitEvent(Event$1.wrap(event));
                  case "propagate":
                      return this._handleEventPropagation(script, event);
                  case "meta":
                      return this._handleMetaData(script, event);
                  case "storage":
                      return this._handleStorageRequest(script, event);
              }
          }
      }, {
          key: "_handleEventPropagation",
          value: function _handleEventPropagation(script, propagatationEvent) {
              var eventId, scriptsHandlingEvent, _ref1;
              eventId = (_ref1 = propagatationEvent.args) != null ? _ref1[0] : void 0;
              if (!this._eventIsBeingHandled(eventId)) {
                  return;
              }
              scriptsHandlingEvent = this._pendingEvents[eventId].scripts;
              if (scriptsHandlingEvent.indexOf(script) < 0) {
                  return;
              }
              switch (propagatationEvent.name) {
                  case "none":
                      return delete this._pendingEvents[eventId];
                  case "all":
                      return this._stopHandlingEvent(script, eventId);
                  default:
                      return this._log("w", "received unknown propagation type:", propagatationEvent.name);
              }
          }

          /**
           * Handles a meta data event, such as setting the script name.
           * @param {Script} script
           * @param {Event} event
           */

      }, {
          key: "_handleMetaData",
          value: function _handleMetaData(script, event) {
              var name, uniqueName;
              switch (event.name) {
                  case "name":
                      name = event.args[0];
                      if (!this._isValidName(name)) {
                          return;
                      }
                      uniqueName = this._getUniqueName(name);
                      return script.setName(uniqueName);
              }
          }

          /**
           * Returns true if the given script name contains only valid characters.
           * @param {string} name The script name.
           * @return {boolean}
           */

      }, {
          key: "_isValidName",
          value: function _isValidName(name) {
              return name && /^[a-zA-Z0-9\/_-]+$/.test(name);
          }

          /**
           * Appends numbers to the end of the script name until it is unique.
           * @param {string} name
           */

      }, {
          key: "_getUniqueName",
          value: function _getUniqueName(name) {
              var originalName, suffix;
              originalName = name = name.slice(0, +(ScriptHandler.MAX_NAME_LENGTH - 1) + 1 || 9e9);
              suffix = 1;
              while (this.getScriptNames().indexOf(name) >= 0) {
                  suffix++;
                  name = originalName + suffix;
              }
              return name;
          }

          /**
           * Handles loading or saving information to storage for the given script.
           * @param {Script} script The script wishing to use the storage.
           * @param {Event} event The event which contains the object to save.
           */

      }, {
          key: "_handleStorageRequest",
          value: function _handleStorageRequest(script, event) {
              switch (event.name) {
                  case "save":
                      // itemToSave = event.args[0];
                      return this.emit("save", script.getName(), event.args[0]);
                  case "load":
                      return this.emit("load", script.getName(), function (item) {
                          return script.postMessage(new Event$1("system", "loaded", item));
                      });
              }
          }
      }, {
          key: "storageChanged",
          value: function storageChanged(script, change) {
              return script.postMessage(new Event$1("system", "storage_changed", change));
          }
      }, {
          key: "getScriptNames",
          value: function getScriptNames() {
              return iter(this._scripts).values().map(function (script) {
                  return script.getName();
              });
          }
      }, {
          key: "getScriptByName",
          value: function getScriptByName(name) {
              return iter(this._scripts).find(function (script) {
                  return script.getName() === name;
              });
          }
      }, {
          key: "_emitEvent",
          value: function _emitEvent(event) {
              return this.emit(event.type, event);
          }
      }, {
          key: "_stopHandlingEvent",
          value: function _stopHandlingEvent(script, eventId) {
              var scriptsHandlingEvent = this._pendingEvents[eventId].scripts;
              removeFromArray(scriptsHandlingEvent, script);
              if (!this._eventIsBeingHandled(eventId)) {
                  var event = this._pendingEvents[eventId].event;
                  delete this._pendingEvents[eventId];
                  return this._emitEvent(event);
              }
          }
      }, {
          key: "tearDown",
          value: function tearDown() {
              return removeEventListener("message", this._handleEvent);
          }
      }]);
      return ScriptHandler;
  }(EventEmitter);
  ScriptHandler.MAX_NAME_LENGTH = 20;

  /**
   * The amount of time a script has to acknowlege an event by calling
   * propagate. If it fails to call propagate within this many milliseconds
   * of receiving the event, the script will be uninstalled.
   */
  ScriptHandler.PROPAGATION_TIMEOUT = 5000; // 5 seconds

  /**
   * A set of events that cannot be intercepted by scripts.
   */
  ScriptHandler.UNINTERCEPTABLE_EVENTS = {
      "command help": "command help",
      "command about": "command about",
      "command install": "command install",
      "command uninstall": "command uninstall",
      "command scripts": "command scripts"
  };

  /**
   * Events that a script can listen for.
   */
  ScriptHandler.HOOKABLE_EVENTS = ["command", "server", "message"];

  /**
   * Events that are generated and sent by the script handler.
   */
  ScriptHandler.SCRIPTING_EVENTS = ["save", "load"];

  (function () {
      "use strict";

      var chat, scriptHandler, userInput;
      userInput = new UserInputHander($("#input"), $(window));
      scriptHandler = new ScriptHandler();
      chat = new Chat();

      userInput.setContext(chat);
      userInput.setKeyboardShortcuts(chat.getKeyboardShortcuts());

      scriptHandler.addEventsFrom(chat);
      scriptHandler.addEventsFrom(userInput);

      chat.listenToCommands(scriptHandler);
      chat.listenToScriptEvents(scriptHandler);
      chat.listenToIRCEvents(scriptHandler);
      chat.init();
  }).call(this);

}());
//# sourceMappingURL=main.js.map