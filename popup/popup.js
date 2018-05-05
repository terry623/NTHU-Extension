window._crypto = null;
import { getUrlVars } from "./helper";
import { getUserName, getCourseInfo, getResultCourse, getGrade } from "./api";
import { getCart } from "./cart";
import { collectionOfCourse, searchByKeyword } from "./server";

$(document).ready(function() {
  $(".content_item").hide();

  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    function(tabs) {
      var acix = getUrlVars(tabs[0].url)["ACIXSTORE"];
      // console.log("ACIXSTORE is " + acix);
      getUserName(acix);
      var stu_no = getUrlVars(tabs[0].url)["hint"];

      // FIXME: 科目空白數很不固定，0 ~ 2 個都有，而且不是全站統一。可以把 Data 丟進 DB 去檢查。
      // const course_no_file = "10620CS  342300";
      // const course_have_file = "10620CS  340400";

      //  選課紀錄
      //  100  第 1 次選課 log 記錄
      //  100P 第 1 次選課亂數結果
      //  101  第 2 次選課 log 記錄
      //  101P 第 2 次選課結束(已亂數處理)
      //  200  第 3 次選課 log 記錄
      //  200P 第 3 次選課結束(已亂數處理)
      //  200S 加退選開始前(含擋修、衝堂)
      //  300  加退選 log 記錄
      //  300P 加退選結束(已處理)
      //  400  停修 log 記錄
      var phaseNo = "100";
      getResultCourse(acix, stu_no, phaseNo, "106", "20");
      getCart(acix);

      getGrade(acix, stu_no);
      collectionOfCourse();

      $("#change_phase").dropdown({
        on: "click",
        action: function(text, value, element) {
          getResultCourse(acix, stu_no, value, "106", "20");
          $("#change_phase").dropdown("set text", text);
          $("#change_phase").dropdown("hide");
        }
      });

      $("#search_result > tbody > tr").click(function() {
        $(this).css("cursor", "pointer");
        var course_from_click = $("td:nth-child(1)", this).text();
        // console.log(course_from_click);
        getCourseInfo(acix, course_from_click, true);
      });

      $("#submit").click(function() {
        chrome.storage.sync.get("cart", function(items) {
          chrome.storage.sync.get("cart", function(items) {
            var temp = {};
            var data = {
              course_name: $("#course_name").text(),
              time: $("#time").text()
            };

            if (items.cart != undefined) {
              Object.assign(temp, items.cart);
              temp[$("#no").text()] = data;

              chrome.storage.sync.remove("cart", function() {
                chrome.storage.sync.set({ cart: temp }, function() {
                  chrome.storage.sync.get("cart", function(items) {
                    // console.log(items);
                    getCart(acix);
                  });
                });
              });
            } else {
              temp[$("#no").text()] = data;
              chrome.storage.sync.set({ cart: temp }, function() {
                chrome.storage.sync.get("cart", function(items) {
                  // console.log(items);
                  getCart(acix);
                });
              });
            }
          });
        });
        // TODO: 秀出的訊息還沒有修改
        $(".mini.modal").modal("show");
      });
    }
  );
});

chrome.storage.sync.clear(function() {
  console.log("Clear Storage Data");
});

// TODO: 在課程介紹頁面，還要放此門的推薦 & 相關課程
$(".ui.accordion").accordion();
$(".ui.tabular.menu").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown")) {
    $(this)
      .addClass("active")
      .siblings(".item")
      .removeClass("active");

    var t = $(".ui.compact.table");
    t.show();

    if ($(this).hasClass("tab1")) {
      t.not(".tab1").hide();
      $("#change_phase").show();
      $("#cart_submit").hide();
    } else if ($(this).hasClass("tab2")) {
      t.not(".tab2").hide();
      $("#cart_submit").show();
      $("#change_phase").hide();
    }
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
  }
});
$("#clickme").click(function() {
  searchByKeyword($("#keyword").val());
  $(".first.modal").modal("show");
});
// TODO: 將存在 Storage 的課表送去校務資訊系統選課
$("#cart_submit").click(function() {});
$("#search_result > tbody > tr").hover(function() {
  $(this).css("cursor", "pointer");
});
$(".ui.mini.modal").modal({
  inverted: true,
  duration: 200
});
$(".coupled.modal").modal({
  allowMultiple: false
});
$(".second.modal").modal({
  inverted: true
});
$(".first.modal").modal({
  inverted: true
});
$("#back").click(function() {
  $(".first.modal").modal("show");
});
