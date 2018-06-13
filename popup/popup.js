window._crypto = null;
import { getUrlVars } from "./helper";
import { getUserName, getResultCourse } from "./api";
import { getCart } from "./cart";
import { getCurrentStateOfNTHU } from "./server";
import { clearAllTime } from "./conflict";
// import {
//   getRecommendPage,
//   toStorage,
//   before_hits_group,
//   compare_group,
//   num_of_old_course,
//   num_of_each_similar
// } from "./recommend";

const year = "107";
const semester = "10";
const search_result_num = 10;
let acix, stu_no;

$(document).ready(function() {
  $(".content_item").hide();
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      acix = getUrlVars(tabs[0].url)["ACIXSTORE"];
      stu_no = getUrlVars(tabs[0].url)["hint"];
      clearAllTime();

      $("#home_loading").addClass("active");
      getUserName(function() {
        getCurrentStateOfNTHU(function(phase) {
          $(".content_item.homePage").show();
          $("#home_loading").removeClass("active");
          if (phase != undefined) {
            getResultCourse(stu_no, phase, year, semester);
          } else $("#change_phase").addClass("disabled");
          getCart();
          // getGrade(stu_no);

          chrome.webRequest.onBeforeSendHeaders.addListener(
            function(details) {
              console.log(details);
              var headers = details.requestHeaders;
              var blockingResponse = {};
              headers.push({
                name: "Referer",
                value:
                  "https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH713004.php?ACIXSTORE=" +
                  acix
              });
              blockingResponse.requestHeaders = headers;
              return blockingResponse;
            },
            {
              urls: [
                "https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH7130041.php"
              ]
            },
            ["requestHeaders", "blocking"]
          );
        });
      });
    }
  );
});

// chrome.storage.local.clear(function() {
//   console.log("Clear Local Data");
//   var error = chrome.runtime.lastError;
//   if (error) {
//     console.error(error);
//   }
// });

$(".ui.accordion").accordion();
$(".ui.dropdown").dropdown();
$("#change_phase").dropdown({
  on: "click",
  action: function(text, value) {
    console.log("Click change phase");
    getResultCourse(stu_no, value, year, semester, function() {
      $("#course_result_loading").removeClass("active");
    });
    $("#change_phase").dropdown("set text", text);
    $("#change_phase").dropdown("hide");
  }
});
$(".ui.modal").modal({
  inverted: true
});
$(".ui.secondary.menu").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown") && !$(this).is(".notActive")) {
    if ($(this).hasClass("recommendPage")) {
      alert("此為內部測試版本，「推薦課程」尚未完成 !");
      return;
    }
    $(this)
      .addClass("active")
      .siblings(".item")
      .removeClass("active");

    let t = $(".content_item");
    t.show();
    $("#change_school_table").hide();

    if ($(this).hasClass("homePage")) {
      t.not(".homePage").hide();
    } else if ($(this).hasClass("searchPage")) {
      t.not(".searchPage").hide();
    } else if ($(this).hasClass("choosePage")) {
      t.not(".choosePage").hide();

      $("#change_school_table").show();
    } else if ($(this).hasClass("recommendPage")) {
      // t.not(".recommendPage").hide();
      // before_hits_group.length = 0;
      // compare_group.length = 0;
      // let content_group = [];
      // getRecommendPage(function() {
      //   if (
      //     before_hits_group.length ==
      //     num_of_old_course * num_of_each_similar
      //   ) {
      //     toStorage(function(content, count, compare_value) {
      //       content_group.push({ content, compare_value });
      //       if (count == num_of_old_course * num_of_each_similar - 1) {
      //         content_group.sort(function(a, b) {
      //           return b.compare_value - a.compare_value;
      //         });
      //         for (let each in content_group) {
      //           let data = content_group[each];
      //           $("#recommend_list").append(data.content);
      //         }
      //         $("#recommend_loading").removeClass("active");
      //       }
      //     });
      //   }
      // });
    }
  }
});

export { acix, search_result_num };
