window._crypto = null;
import { initDrift } from "./drift";
initDrift();
import { getUrlVars } from "./helper";
import { getUserName, getResultCourse, getGrade, getCourseInfo } from "./api";
import { searchByKeyword, searchBySingleCourseNo } from "./search";
import { getCart } from "./cart";
import { collectionOfCourse, getCurrentStateOfNTHU } from "./server";

const year = "106";
const semester = "20";
var acix, stu_no;

// TODO: 降低送要求到 Server 的次數，有些一次性、或每天執行一次的要求，改成在 event.js 執行
$(document).ready(function() {
  $(".content_item").hide();
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      acix = getUrlVars(tabs[0].url)["ACIXSTORE"];
      stu_no = getUrlVars(tabs[0].url)["hint"];

      getUserName(acix, function() {
        $(".content_item.homePage").show();
        getCurrentStateOfNTHU(function(phase) {
          if (phase != undefined)
            getResultCourse(acix, stu_no, phase, year, semester);
          else $("#change_phase").addClass("disabled");

          getCart(acix);
          getGrade(acix, stu_no);
          collectionOfCourse();
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

// TODO: 想清楚換頁的時候有什麼東西沒有重置，整個頁面好好檢查
$(".ui.accordion").accordion();
$(".ui.dropdown").dropdown();
$(".course_type.browse").popup({
  popup: $(".ui.course_type.popup"),
  position: "bottom right",
  on: "click"
});
$("#submit").on("click", function() {
  chrome.storage.local.get("cart", function(items) {
    var get_course_id = $(".ui.piled.segment").attr("id");
    var temp = {};
    var data = {
      course_no: $("#no").text(),
      course_name: $("#course_name").text(),
      time: $("#time").text()
    };

    if (items.cart != undefined) {
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
  });
  $("#submit_to_list").modal("show");
});
$("#delete").on("click", function() {
  chrome.storage.local.get("cart", function(items) {
    var get_course_id = $(".ui.piled.segment").attr("id");
    var temp = {};
    Object.assign(temp, items.cart);
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
  var course_from_click = $("td:nth-child(1)", this).text();
  var course_id = $(this).attr("id");
  getCourseInfo(acix, course_from_click, course_id, function() {
    $(".course_action").hide();
    $("#submit").show();
    $("#back").show();
    $("#course_info_loading").removeClass("active");
  });
});
$(".clicktosearch").on("click", function() {
  var topic = $("#topic_name").text();
  var keyword = $("#keyword").val();
  if ($("#keyword").val() == "") {
    $("#search_alert_empty").modal("show");
  } else if (topic.includes("Topic")) {
    $("#search_alert_topic").modal("show");
  } else {
    searchByKeyword(acix, keyword, topic, function() {
      $("#search_loading").removeClass("active");
      $("#search_entry").hide();
      $("#search_bar").show();
      $("#search_result_page").show();
    });
    $("#search_page_change > a").removeClass("active");
    $("#search_page_change > a:nth-child(2)").addClass("active");
  }
});
$("#search_page_change").on("click", ".page.item", function() {
  $(this)
    .addClass("active")
    .siblings(".item")
    .removeClass("active");
  var start = (parseInt($(this).text()) - 1) * 10;
  $("#search_result_body  > tr")
    .show()
    .filter(function(index) {
      return index < start || index >= start + 10;
    })
    .hide();
});
$("#change_phase").dropdown({
  on: "click",
  action: function(text, value, element) {
    getResultCourse(acix, stu_no, value, "106", "20", function() {
      $("#course_result_loading").removeClass("active");
    });
    $("#change_phase").dropdown("set text", text);
    $("#change_phase").dropdown("hide");
  }
});
$("#change_school_table").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown")) {
    var t = $(".ui.compact.table");
    t.show();

    if ($(this).hasClass("tab1")) {
      t.not(".tab1").hide();
      $("#change_phase").show();
      $("#cart_submit").hide();
      $("#left_pointing_to_school").hide();
    } else if ($(this).hasClass("tab2")) {
      t.not(".tab2").hide();
      $("#cart_submit").show();
      $("#left_pointing_to_school").show();
      $("#change_phase").hide();
    }
  }
});
$(".ui.secondary.menu").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown") && !$(this).is(".notActive")) {
    drift.on("ready", function(api, payload) {
      api.sidebar.close();
      api.widget.hide();
    });
    $(this)
      .addClass("active")
      .siblings(".item")
      .removeClass("active");

    var t = $(".content_item");
    t.show();
    $("#search_bar").hide();
    $("#change_school_table").hide();

    if ($(this).hasClass("homePage")) {
      t.not(".homePage").hide();
      drift.on("ready", function(api, payload) {
        api.widget.show();
        // api.sidebar.open();
      });
    } else if ($(this).hasClass("searchPage")) {
      t.not(".searchPage").hide();
      $("#search_bar").hide();
      $("#search_result_page").hide();
      $("#search_entry").show();
    } else if ($(this).hasClass("choosePage")) {
      t.not(".choosePage").hide();
      $("#change_school_table").show();
    } else if ($(this).hasClass("recommendPage"))
      t.not(".recommendPage").hide();
  }
});
$(".ui.modal").modal({
  inverted: true
});
$(".ui.course_type.popup").on("click", ".item", function() {
  $("#topic_name").html($(this).text() + `<i class="dropdown icon"></i>`);
  $(".ui.course_type.popup").popup("hide all");
});
$("#cart_submit").on("click", function() {
  alert("Send cart to school !");
});
$("#multiple_class_list").on("click", ".item", function() {
  var course_no = $(this).attr("course_no");
  var id = $(this).attr("id");
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
