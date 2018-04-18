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
	
	var _content = __webpack_require__(1);
	
	var content = _interopRequireWildcard(_content);
	
	var _data = __webpack_require__(3);
	
	var data = _interopRequireWildcard(_data);
	
	var _help = __webpack_require__(2);
	
	var help = _interopRequireWildcard(_help);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _help = __webpack_require__(2);
	
	var _data = __webpack_require__(3);
	
	var acix = (0, _help.getUrlParameter)("ACIXSTORE");
	console.log("ACIXSTORE is " + acix);
	
	// setTimeout(function() {
	//   change();
	// }, 10000);
	
	// function change() {
	//   console.log("Change...");
	//   var document = window.frames[2]["document"];
	//   $("body", document).append(main);
	// }

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var getUrlParameter = function getUrlParameter(sParam) {
	  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
	      sURLVariables = sPageURL.split("&"),
	      sParameterName,
	      i;
	
	  for (i = 0; i < sURLVariables.length; i++) {
	    sParameterName = sURLVariables[i].split("=");
	
	    if (sParameterName[0] === sParam) {
	      return sParameterName[1] === undefined ? true : sParameterName[1];
	    }
	  }
	};
	
	exports.getUrlParameter = getUrlParameter;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var main = "";
	exports.main = main;

/***/ })
/******/ ]);
//# sourceMappingURL=content.bundle.js.map