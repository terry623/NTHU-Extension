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
	
	var _event = __webpack_require__(4);
	
	var event = _interopRequireWildcard(_event);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/***/ }),
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ (function(module, exports) {

	"use strict";
	
	//指定比對的url：不允許片段表達式
	//例如： *://*.google.com.tw/* 作為查詢字串不被接受因為host是一個片段表達式
	var urlPattern = "*://www.google.com.tw/*";
	
	//利用 tabs.query api 查找畫面上的所有tab
	function queryTabsAndShowPageActions(queryObject) {
	  chrome.tabs.query(queryObject, function (tabs) {
	    if (tabs && tabs.length > 0) {
	      for (var i = 0; i < tabs.length; i++) {
	        //在加載完畢的tab上，使用chrome.pageAction.show 啟用按鈕
	        if (tabs[i].status === "complete") chrome.pageAction.show(tabs[i].id);
	      }
	    }
	  });
	}
	
	//第一次的初始化：extension初次載入時
	chrome.runtime.onInstalled.addListener(function () {
	  queryTabsAndShowPageActions({
	    active: false,
	    currentWindow: true,
	    url: urlPattern
	  });
	});
	//每次tab有變動，檢查現在這個current tab是否在指定的 url pattern底下
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	  queryTabsAndShowPageActions({
	    active: true,
	    currentWindow: true,
	    url: urlPattern
	  });
	});

/***/ })
/******/ ]);
//# sourceMappingURL=event.bundle.js.map