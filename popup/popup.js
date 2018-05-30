window._crypto = null;
import { initDrift } from "./drift";
initDrift();
import { getUrlVars } from "./helper";
import { getUserName, getResultCourse, getGrade, getCourseInfo } from "./api";
import {
  searchByKeyword,
  searchBySingleCourseNo,
  storeCourseInfo,
  dependOnType
} from "./search";
import { getCart } from "./cart";
// import {
//   getRecommendPage,
//   toStorage,
//   before_hits_group,
//   compare_group,
//   num_of_old_course,
//   num_of_each_similar
// } from "./recommend";
import { getCurrentStateOfNTHU } from "./server";
import { planAllCourse } from "./select";

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

      getUserName(acix, function() {
        $(".content_item.homePage").show();
        getCurrentStateOfNTHU(function(phase) {
          if (phase != undefined)
            getResultCourse(acix, stu_no, phase, year, semester);
          else $("#change_phase").addClass("disabled");

          getCart(acix);
          getGrade(acix, stu_no);
          // planAllCourse(acix);
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
$("#clicktosearch").on("click", function() {
  let topic = $("#topic_name").text();
  let keyword = $("#keyword").val();
  if (topic.includes("請選擇類別")) {
    $("#search_alert_topic").modal("show");
  } else if ($("#keyword").val() == "") {
    $("#search_alert_keyword_empty").modal("show");
  } else {
    let other_keyword = "NoNeedToChoose";
    if (topic == "上課時間") {
      other_keyword = $("#time_select_text").val();
    } else if (topic == "通識對象") {
      other_keyword = $("#ge_people_text").val();
    } else if (topic == "通識類別") {
      other_keyword = $("#ge_type_select_text").val();
    } else if (topic == "系必選修") {
      other_keyword = $("#dept_entry_text").val();
    } else if (topic == "學分學程") {
      other_keyword = $("#program_entry_text").val();
    } else if (topic == "第一二專長") {
      other_keyword = $("#skill_entry_text").val();
    }

    if (other_keyword == "") {
      $("#search_alert_otherkeyword_empty").modal("show");
      return;
    } else if (other_keyword == "NoNeedToChoose") {
      other_keyword = "";
    }
    searchByKeyword(acix, keyword, other_keyword, topic, function() {
      $("#search_loading").removeClass("active");
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
    if ($(this).hasClass("recommendPage")) return;
    drift.on("ready", function(api, payload) {
      api.sidebar.close();
      api.widget.hide();
    });
    $(this)
      .addClass("active")
      .siblings(".item")
      .removeClass("active");


    let t = $(".content_item");
    t.show();
    $("#change_school_table").hide();

    if ($(this).hasClass("homePage")) {
      t.not(".homePage").hide();
      drift.on("ready", function(api, payload) {
        api.widget.show();
      });
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
  if (
    $("#topic_name")
      .text()
      .includes("請選擇類別") == false
  )
    $("#keyword").val("");
  $("#topic_name").text($(this).text());
  $(".ui.course_type.popup").popup("hide all");
});
$("#cart_submit").on("click", function() {
  alert("Send cart to school !");
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
