window._crypto = null;
var iconv = require("iconv-lite");
var request = require("request");
import { getUrlVars } from "./helper";

$.fn.api.settings.api = {
  "get user":
    "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/4/4.19/JH4j002.php?ACIXSTORE={ACIXSTORE}"
};

$.fn.api.settings.successTest = function(response) {
  if (response && response.success) {
    return response.success;
  }
  return false;
};

$(document).ready(function() {
  $(".content_item").hide();

  var username;
  var acix;
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      acix = getUrlVars(tabs[0].url)["ACIXSTORE"];
      console.log("ACIXSTORE is " + acix);

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

      // $("#user")
      //   .api({
      //     action: "get user",
      //     on: "now",
      //     urlData: {
      //       ACIXSTORE: acix
      //     },
      //     onResponse: function(response) {
      //       // make some adjustments to response
      //       console.log(response);
      //       return response;
      //     },
      //     successTest: function(response) {
      //       // test whether a JSON response is valid
      //       return response.success || false;
      //     },
      //     onComplete: function(response) {
      //       // make some adjustments to response
      //       console.log(response);
      //       console.log("---------------------");
      //       // var buf = iconv.encode(response, "Big5");
      //       var str = decodeURIComponent(response);
      //       var buf = iconv.decode(new Buffer(str), "Big5");
      //       // var str = iconv.decode(new Buffer(response), "big5");
      //       // var str = decodeURIComponent(response);
      //       console.log(buf);
      //     }
      //   })
      //   .text("NOTYET");
    }
  );
});

$(".ui.dropdown").dropdown();

$("#clickme").click(function() {
  console.log("Click Button");
  $("#testModal").modal("show");
});

$(".ui.menu").on("click", ".item", function() {
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
  }
});
