window._crypto = null;
import { getUrlVars } from "./helper";
import { getUserName, getResultCourse, getCourseInfo } from "./api";
import {
  clickToSearch,
  searchBySingleCourseNo,
  storeCourseInfo,
  dependOnType
} from "./search";
import { getCart } from "./cart";
import { getCurrentStateOfNTHU } from "./server";
import { submitToNTHU, storeOrderToStorage } from "./select";
import { removeTimeOfCourse } from "./conflict";
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
var acix, stu_no;

$(document).ready(function() {
  $(".content_item").hide();
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      acix = getUrlVars(tabs[0].url)["ACIXSTORE"];
      stu_no = getUrlVars(tabs[0].url)["hint"];

      $("#home_loading").addClass("active");
      getUserName(acix, function() {
        getCurrentStateOfNTHU(function(phase) {
          $(".content_item.homePage").show();
          $("#home_loading").removeClass("active");
          if (phase != undefined)
            getResultCourse(acix, stu_no, phase, year, semester);
          else $("#change_phase").addClass("disabled");
          getCart(acix);
          // getGrade(acix, stu_no);

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

chrome.storage.local.clear(function() {
  console.log("Clear Local Data");
  var error = chrome.runtime.lastError;
  if (error) {
    console.error(error);
  }
});

$(".ui.accordion").accordion();
$(".ui.dropdown").dropdown();
$(".course_type.browse").popup({
  popup: $(".ui.course_type.popup"),
  position: "bottom left",
  on: "click"
});

$("#submit").on("click", function() {
  chrome.storage.local.get("cart", function(items) {
    let get_course_id = $(".course_info.scrolling.content").attr("id");
    let temp = {};
    let time_array = $("#time")
      .text()
      .split(",");
    let order = -1;

    if (
      $("#GE_type").text() != "" ||
      $("#no")
        .text()
        .includes("PE")
    ) {
      order = 0;
    }

    let data = {
      course_no: $("#no").text(),
      course_name: $("#course_name").text(),
      time: time_array,
      order: order
    };

    if (items.cart != undefined) {
      if (items.cart.hasOwnProperty(get_course_id)) {
        $("#already_in_cart").modal("show");
        return;
      }

      Object.assign(temp, items.cart);
      temp[get_course_id] = data;

      chrome.storage.local.remove("cart", function() {
        chrome.storage.local.set({ cart: temp }, function() {
          chrome.storage.local.get("cart", function(items) {
            // console.log(items);
            getCart(acix);
          });
        });
      });
    } else {
      temp[get_course_id] = data;
      chrome.storage.local.set({ cart: temp }, function() {
        chrome.storage.local.get("cart", function(items) {
          // console.log(items);
          getCart(acix);
        });
      });
    }
    $("#submit_to_list").modal("show");
  });
});
$("#delete").on("click", function() {
  chrome.storage.local.get("cart", function(items) {
    var get_course_id = $(".course_info.scrolling.content").attr("id");
    var temp = {};
    Object.assign(temp, items.cart);
    removeTimeOfCourse(temp[get_course_id].time);
    delete temp[get_course_id];

    chrome.storage.local.remove("cart", function() {
      chrome.storage.local.set({ cart: temp }, function() {
        chrome.storage.local.get("cart", function(items) {
          // console.log(items);
          getCart(acix);
        });
      });
    });
    $("#delete_course_msg").modal("show");
  });
});
$("#search_result_body").on("click", "tr", function() {
  $(this).css("cursor", "pointer");
  let course_from_click = $("td:nth-child(1)", this).text();
  let course_id = $(this).attr("id");
  getCourseInfo(
    acix,
    course_from_click,
    course_id,
    function() {
      $(".course_action").hide();
      $("#submit").show();
      $("#back").show();
      $("#course_info_loading").removeClass("active");
    },
    false
  );
});
$("#keyword").keypress(function(e) {
  if (e.which == 13) {
    clickToSearch(acix);
  }
});
$("#clicktosearch").on("click", function() {
  clickToSearch(acix);
});
$("#search_page_change").on("click", ".page.item", function() {
  $(this)
    .addClass("active")
    .siblings(".item")
    .removeClass("active");
  let start = (parseInt($(this).text()) - 1) * search_result_num;
  $("#search_result_body  > tr")
    .show()
    .filter(function(index) {
      return index < start || index >= start + search_result_num;
    })
    .hide();
});
$("#change_phase").dropdown({
  on: "click",
  action: function(text, value, element) {
    getResultCourse(acix, stu_no, value, year, semester, function() {
      $("#course_result_loading").removeClass("active");
    });
    $("#change_phase").dropdown("set text", text);
    $("#change_phase").dropdown("hide");
  }
});
$("#change_school_table").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown")) {
    let t = $(".ui.compact.table");
    t.show();

    if ($(this).hasClass("tab1")) {
      t.not(".tab1").hide();
      $("#cart_submit").hide();
      $("#left_pointing_to_school").hide();
      $("#change_phase").show();
      $("#change_phase_text").show();
      $("#change_phase_icon").show();
    } else if ($(this).hasClass("tab2")) {
      t.not(".tab2").hide();
      $("#cart_submit").show();
      $("#left_pointing_to_school").show();
      $("#change_phase").hide();
      $("#change_phase_text").hide();
      $("#change_phase_icon").hide();
    }
  }
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
      // getRecommendPage(acix, function() {
      //   if (
      //     before_hits_group.length ==
      //     num_of_old_course * num_of_each_similar
      //   ) {
      //     toStorage(acix, function(content, count, compare_value) {
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
$(".ui.modal").modal({
  inverted: true
});
$(".ui.course_type.popup").on("click", ".item", function() {
  dependOnType($(this).text());
  $("#keyword").val("");
  $("#topic_name").text($(this).text());
  $(".ui.course_type.popup").popup("hide all");
  $(".other_entry_dropdown").dropdown("show");
});
$("#multiple_class_list").on("click", ".item", function() {
  let course_no = $(this).attr("course_no");
  let id = $(this).attr("id");
  getCourseInfo(
    acix,
    course_no,
    id,
    function() {
      $(".course_action").hide();
      $("#delete").show();
      $("#back").show();
    },
    true
  );
});
$("#multiple_class_bySingle").on("click", ".item", function() {
  let course_no = $(this).attr("course_no");
  searchBySingleCourseNo(course_no, function(hits) {
    storeCourseInfo(hits, function() {
      getCourseInfo(
        acix,
        course_no,
        hits[0]._id,
        function() {
          $(".course_action").hide();
        },
        true
      );
    });
  });
});
$("#conflict_explain").popup();
$("#cart_submit").on("click", function() {
  // alert("此為內部測試版本，選完課請到「預排系統」查看 !");
  let childNum = $("#course_order_list").attr("course_num");
  if (childNum > 0) {
    let list = document.getElementById("course_order_list");
    Sortable.create(list, {
      onUpdate: function(evt) {
        $("#course_order_list > div > .number").each(function() {
          $(this).text(
            $(this)
              .parent()
              .index() + 1
          );
        });
      }
    });
    $("#course_order").modal("show");
  } else {
    $("#send_to_nthu_loading").addClass("active");
    submitToNTHU(acix);
  }
});
$("#send_to_nthu").on("click", function() {
  $("#course_order").modal("hide");
  $("#send_to_nthu_loading").addClass("active");
  let course_id_group = [];
  $("#course_order_list > div > .number").each(function() {
    let course_id = $(this).attr("id");
    let order = $(this).text();
    course_id_group.push({ course_id, order });
  });

  storeOrderToStorage(course_id_group, function() {
    submitToNTHU(acix);
  });
});
// $("#recommend_list").on("click", ".item", function() {
//   let course_no = $(this).attr("course_no");
//   let id = $(this).attr("id");
//   getCourseInfo(
//     acix,
//     course_no,
//     id,
//     function() {
//       $(".course_action").hide();
//       $("#submit").show();
//       $("#back").show();
//       $("#course_info_loading").removeClass("active");
//     },
//     false
//   );
// });
