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
	
	var _api = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./api\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	
	var api = _interopRequireWildcard(_api);
	
	var _pdf2html = __webpack_require__(11);
	
	var pdf2html = _interopRequireWildcard(_pdf2html);
	
	var _helper = __webpack_require__(5);
	
	var helper = _interopRequireWildcard(_helper);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/***/ }),
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	var _helper = __webpack_require__(5);
	
	var _api = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./api\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
	
	window._crypto = null;
	
	
	$.fn.api.settings.api = {
	  // "get user":
	  //   "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/4/4.19/JH4j002.php?ACIXSTORE={ACIXSTORE}"
	};
	
	$.fn.api.settings.successTest = function (response) {
	  if (response && response.success) {
	    return response.success;
	  }
	  return false;
	};
	
	$(document).ready(function () {
	  $(".content_item").hide();
	
	  chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, function (tabs) {
	    var acix = (0, _helper.getUrlVars)(tabs[0].url)["ACIXSTORE"];
	    console.log("ACIXSTORE is " + acix);
	    (0, _api.getUserName)(acix);
	
	    var stu_no = (0, _helper.getUrlVars)(tabs[0].url)["hint"];
	
	    // TODO:有的科目空白數是一格，有的是兩個，要用 OR 的做處理
	    var course_no_file = "10620CS  342300";
	    var course_have_file = "10620CS  340400";
	    var course_from_ISS = "10620ISS 508400";
	    (0, _api.getCourseInfo)(acix, course_from_ISS);
	
	    //  選課紀錄
	    //  100  第 1 次選課 log 記錄
	    //  100P 第 1 次選課亂數結果
	    //  101P 第 2 次選課 log 記錄
	    //  101P 第 2 次選課結束(已亂數處理)
	    //  200  第 3 次選課 log 記錄
	    //  200P 第 3 次選課結束(已亂數處理)
	    //  200S 加退選開始前(含擋修、衝堂)
	    //  300  加退選 log 記錄
	    //  300P 加退選結束(已處理)
	    //  400  停修 log 記錄
	    var phaseNo = "100";
	    (0, _api.getResultCourse)(acix, stu_no, phaseNo, "106", "20");
	  });
	});
	
	// Initial
	$(".ui.dropdown").dropdown();
	$(".shape").shape();
	$(".ui.accordion").accordion();
	$("#clicktoflip").click(function () {
	  $(".shape").shape("flip right");
	});
	$(".ui.tabular.menu").on("click", ".item", function () {
	  if (!$(this).hasClass("dropdown")) {
	    $(this).addClass("active").siblings(".item").removeClass("active");
	
	    var t = $(".ui.compact.table");
	    t.show();
	
	    if ($(this).hasClass("tab1")) t.not(".tab1").hide();else if ($(this).hasClass("tab2")) t.not(".tab2").hide();
	  }
	});
	
	$(".ui.pointing.menu").on("click", ".item", function () {
	  if (!$(this).hasClass("dropdown")) {
	    $(this).addClass("active").siblings(".item").removeClass("active");
	
	    var t = $(".content_item");
	    t.show();
	
	    if ($(this).hasClass("homePage")) t.not(".homePage").hide();else if ($(this).hasClass("searchPage")) t.not(".searchPage").hide();else if ($(this).hasClass("choosePage")) t.not(".choosePage").hide();else if ($(this).hasClass("recommendPage")) t.not(".recommendPage").hide();else if ($(this).hasClass("singlePage")) t.not(".singlePage").hide();
	  }
	});

/***/ }),
/* 5 */
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

/***/ }),
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	// If absolute URL from the remote server is provided, configure the CORS
	// header on that server.
	// var url;
	
	// Loaded via <script> tag, create shortcut to access PDF.js exports.
	var pdfjsLib = window["pdfjs-dist/build/pdf"];
	
	// The workerSrc property shall be specified.
	pdfjsLib.GlobalWorkerOptions.workerSrc = "../node_modules/pdfjs-dist/build/pdf.worker.js";
	
	var pdfDoc = null,
	    pageNum = 1,
	    pageRendering = false,
	    pageNumPending = null,
	    scale = 0.8,
	    canvas,
	    ctx;
	
	/**
	 * Get page info from document, resize canvas accordingly, and render page.
	 * @param num Page number.
	 */
	function renderPage(num) {
	  pageRendering = true;
	  // Using promise to fetch the page
	  pdfDoc.getPage(num).then(function (page) {
	    var viewport = page.getViewport(scale);
	    canvas.height = viewport.height;
	    canvas.width = viewport.width;
	
	    // Render PDF page into canvas context
	    var renderContext = {
	      canvasContext: ctx,
	      viewport: viewport
	    };
	    var renderTask = page.render(renderContext);
	
	    // Wait for rendering to finish
	    renderTask.promise.then(function () {
	      pageRendering = false;
	      if (pageNumPending !== null) {
	        // New page rendering is pending
	        renderPage(pageNumPending);
	        pageNumPending = null;
	      }
	    });
	  });
	
	  // Update page counters
	  document.getElementById("page_num").textContent = num;
	}
	
	/**
	 * If another page rendering in progress, waits until the rendering is
	 * finised. Otherwise, executes rendering immediately.
	 */
	function queueRenderPage(num) {
	  if (pageRendering) {
	    pageNumPending = num;
	  } else {
	    renderPage(num);
	  }
	}
	
	/**
	 * Displays previous page.
	 */
	function onPrevPage() {
	  if (pageNum <= 1) {
	    return;
	  }
	  pageNum--;
	  queueRenderPage(pageNum);
	}
	
	/**
	 * Displays next page.
	 */
	function onNextPage() {
	  if (pageNum >= pdfDoc.numPages) {
	    return;
	  }
	  pageNum++;
	  queueRenderPage(pageNum);
	}
	
	function transform(url) {
	  /**
	   * Asynchronously downloads PDF.
	   */
	  canvas = document.getElementById("the-canvas");
	  ctx = canvas.getContext("2d");
	
	  document.getElementById("prev").addEventListener("click", onPrevPage);
	  document.getElementById("next").addEventListener("click", onNextPage);
	
	  pdfjsLib.getDocument(url).then(function (pdfDoc_) {
	    pdfDoc = pdfDoc_;
	    document.getElementById("page_count").textContent = pdfDoc.numPages;
	
	    // Initial/first page rendering
	    renderPage(pageNum);
	  });
	}
	
	exports.transform = transform;

/***/ })
/******/ ]);
//# sourceMappingURL=popup.bundle.js.map