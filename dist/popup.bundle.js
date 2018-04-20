/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _popup = __webpack_require__(4);
	
	var popup = _interopRequireWildcard(_popup);
	
	var _helper = __webpack_require__(6);
	
	var helper = _interopRequireWildcard(_helper);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/***/ }),
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _helper = __webpack_require__(6);
	
	$.fn.api.settings.api = {
	  "get user": "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/4/4.19/JH4j002.php?ACIXSTORE={ACIXSTORE}"
	};
	
	$.fn.api.settings.successTest = function (response) {
	  if (response && response.success) {
	    return response.success;
	  }
	  return false;
	};
	
	$(document).ready(function () {
	  var username;
	  var acix;
	  chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function (tabs) {
	    acix = (0, _helper.getUrlVars)(tabs[0].url)["ACIXSTORE"];
	    console.log("ACIXSTORE is " + acix);
	
	    $("#user").api({
	      action: "get user",
	      on: "now",
	      urlData: {
	        ACIXSTORE: acix
	      },
	      onResponse: function onResponse(response) {
	        // make some adjustments to response
	        return response;
	      },
	      successTest: function successTest(response) {
	        // test whether a JSON response is valid
	        return response.success || false;
	      },
	      onComplete: function onComplete(response) {
	        // make some adjustments to response
	        console.log(response);
	      }
	    }).text("NOTYET");
	  });
	});
	
	$(".ui.dropdown").dropdown();
	
	$("#clickme").click(function () {
	  console.log("Click Button");
	  $("#testModal").modal("show");
	});
	
	$(".ui.menu").on("click", ".item", function () {
	  if (!$(this).hasClass("dropdown")) {
	    $(this).addClass("active").siblings(".item").removeClass("active");
	  }
	});

/***/ }),
/* 5 */,
/* 6 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	function getUrlVars(url) {
	  var vars = [];
	  var hash;
	  var hashes = url.slice(url.indexOf("?") + 1).split("&");
	  for (var i = 0; i < hashes.length; i++) {
	    hash = hashes[i].split("=");
	    vars.push(hash[0]);
	    vars[hash[0]] = hash[1];
	  }
	  return vars;
	}
	
	exports.getUrlVars = getUrlVars;

/***/ })
/******/ ]);
//# sourceMappingURL=popup.bundle.js.map