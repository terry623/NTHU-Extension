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
  var username;
  var acix;
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      acix = getUrlVars(tabs[0].url)["ACIXSTORE"];
      console.log("ACIXSTORE is " + acix);

      $("#user")
        .api({
          action: "get user",
          on: "now",
          urlData: {
            ACIXSTORE: acix
          },
          onResponse: function(response) {
            // make some adjustments to response
            return response;
          },
          successTest: function(response) {
            // test whether a JSON response is valid
            return response.success || false;
          },
          onComplete: function(response) {
            // make some adjustments to response
            console.log(response);
          }
        })
        .text("NOTYET");
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
  }
});
