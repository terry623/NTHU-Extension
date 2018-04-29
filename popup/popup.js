window._crypto = null;
import { getUrlVars } from "./helper";
import {
  getUserName,
  getCourseInfo,
  getResultCourse,
  getGrade,
  getGradeDistribution
} from "./api";

$.fn.api.settings.api = {
  // "get user":
  //   "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/4/4.19/JH4j002.php?ACIXSTORE={ACIXSTORE}"
};

$.fn.api.settings.successTest = function(response) {
  if (response && response.success) {
    return response.success;
  }
  return false;
};

$(document).ready(function() {
  $(".content_item").hide();

  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      var acix = getUrlVars(tabs[0].url)["ACIXSTORE"];
      console.log("ACIXSTORE is " + acix);
      getUserName(acix);

      var stu_no = getUrlVars(tabs[0].url)["hint"];

      // FIXME:科目空白數很不固定，0 ~ 2 個都有，而且不是全站統一
      const course_no_file = "10620CS  342300";
      const course_have_file = "10620CS  340400";
      const course_from_ISS = "10620ISS 508400";
      getCourseInfo(acix, course_from_ISS);

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
      getResultCourse(acix, stu_no, phaseNo, "106", "20");
      getGrade(acix);

      const course_good_grade = "10610CS  546000";
      getGradeDistribution(acix, course_good_grade);
    }
  );
});

// Initial
$(".ui.dropdown").dropdown();
$(".shape").shape();
$(".ui.accordion").accordion();
$("#clicktoflip").click(function() {
  $(".shape").shape("flip right");
});
$(".ui.tabular.menu").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown")) {
    $(this)
      .addClass("active")
      .siblings(".item")
      .removeClass("active");

    var t = $(".ui.compact.table");
    t.show();

    if ($(this).hasClass("tab1")) t.not(".tab1").hide();
    else if ($(this).hasClass("tab2")) t.not(".tab2").hide();
  }
});

$(".ui.pointing.menu").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown")) {
    $(this)
      .addClass("active")
      .siblings(".item")
      .removeClass("active");

    var t = $(".content_item");
    t.show();

    if ($(this).hasClass("homePage")) t.not(".homePage").hide();
    else if ($(this).hasClass("searchPage")) t.not(".searchPage").hide();
    else if ($(this).hasClass("choosePage")) t.not(".choosePage").hide();
    else if ($(this).hasClass("recommendPage")) t.not(".recommendPage").hide();
    else if ($(this).hasClass("singlePage")) t.not(".singlePage").hide();
  }
});
