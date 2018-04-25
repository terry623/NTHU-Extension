window._crypto = null;
import { getUrlVars } from "./helper";
import { getUserName, getCourseInfo } from "./api";

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

      const course_no_file = "10620CS  342300";
      const course_have_file = "10620CS  340400";
      getCourseInfo(acix, course_have_file);
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
$(".ui.menu").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown") && !$(this).hasClass("istable")) {
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
