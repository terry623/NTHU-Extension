window._crypto = null;
import { getUrlVars } from "./helper";
import { getUserName, getResultCourse, getGrade, getCourseInfo } from "./api";
import { searchByKeyword } from "./search";
import { getCart } from "./cart";
import {
  collectionOfCourse,
  getNewsFromServer,
  getCurrentPhase
} from "./server";

const year = "106";
const semester = "20";
var acix, stu_no;

chrome.storage.local.clear(function() {
  console.log("Clear Storage Data");
});

// TODO: 要降低送要求到 Server 的次數，有些一次性的要求，改成在 event.js 執行
$(document).ready(function() {
  $(".content_item").hide();
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      acix = getUrlVars(tabs[0].url)["ACIXSTORE"];
      stu_no = getUrlVars(tabs[0].url)["hint"];

      getUserName(acix, function() {
        getNewsFromServer(function() {
          $(".content_item.homePage").show();
          getCurrentPhase(function(phase) {
            $("#home_loading").removeClass("active");
            getResultCourse(acix, stu_no, phase, year, semester);
            getCart(acix);
            getGrade(acix, stu_no);
            collectionOfCourse();
          });
        });
      });
    }
  );
});
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
            console.log(items);
            getCart(acix);
          });
        });
      });
    } else {
      temp[get_course_id] = data;
      chrome.storage.local.set({ cart: temp }, function() {
        chrome.storage.local.get("cart", function(items) {
          console.log(items);
          getCart(acix);
        });
      });
    }
  });
  $("#submit_to_list").modal("show");
});
$("#search_result_body").on("click", "tr", function() {
  $(this).css("cursor", "pointer");
  var course_from_click = $("td:nth-child(1)", this).text();
  var course_id = $(this).attr("id");
  getCourseInfo(acix, course_from_click, course_id, true, function() {
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
$(".ui.pointing.menu").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown") && !$(this).is(".notActive")) {
    $(this)
      .addClass("active")
      .siblings(".item")
      .removeClass("active");

    var t = $(".content_item");
    t.show();
    $("#search_bar").hide();
    $("#change_school_table").hide();

    if ($(this).hasClass("homePage")) t.not(".homePage").hide();
    else if ($(this).hasClass("searchPage")) {
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
$(".ui.mini.modal").modal({
  inverted: true
});
$(".course_info.modal").modal({
  inverted: true
});
$(".reply_form.modal").modal({
  inverted: true
});
$(".ui.course_type.popup").on("click", ".item", function() {
  $("#topic_name").html($(this).text() + `<i class="dropdown icon"></i>`);
  $(".ui.course_type.popup").popup("hide all");
});
$("#cart_submit").on("click", function() {
  alert("Send cart to school !");
});
$("#reply").on("click", function() {
  $(".reply_form.modal").modal("show");
});
