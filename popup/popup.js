window._crypto = null;
var iconv = require("iconv-lite");
var request = require("request");
import { getUrlVars } from "./helper";

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

function getUserName(acix) {
  request(
    {
      url:
        "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/4/4.19/JH4j002.php?ACIXSTORE=" +
        acix,
      encoding: null
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var str = iconv.decode(new Buffer(body), "big5");
        var temp = document.createElement("div");
        temp.innerHTML = str;
        var htmlObject = temp.firstChild;
        var found = $(
          "div > form > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(4)",
          temp
        );

        var welcome = "<div>Hi~ " + found.text() + " !</div>";
        $("#user").prepend(welcome);
        $(".content_item.homePage").show();
      }
    }
  );
}

function getCourseInfo(acix, course_no) {
  request(
    {
      url:
        "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/common/Syllabus/1.php?ACIXSTORE=" +
        acix +
        "&c_key=" +
        course_no,
      encoding: null
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var str = iconv.decode(new Buffer(body), "big5");
        var temp = document.createElement("div");
        temp.innerHTML = str;
        var htmlObject = temp.firstChild;

        var no = $(
          "div > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(2)",
          temp
        );
        var name_zh = $(
          "div > table:nth-child(1) > tbody > tr:nth-child(3) > td.class3",
          temp
        );

        var name_en = $(
          "div > table:nth-child(1) > tbody > tr:nth-child(4) > td.class3",
          temp
        );

        $("#no").text(no.text());
        $("#course_name_zh").text(name_zh.text() + " " + name_en.text());
      }
    }
  );
}

$(document).ready(function() {
  $(".content_item").hide();

  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      var acix = getUrlVars(tabs[0].url)["ACIXSTORE"];
      console.log("ACIXSTORE is " + acix);
      getUserName(acix);

      const course_no = "10620CS  135500";
      getCourseInfo(acix, course_no);
    }
  );
});

$(".ui.dropdown").dropdown();
$(".shape").shape();

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
