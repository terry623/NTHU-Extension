import { getCourseInfo, getResultCourse } from "./api";
import { course_table } from "./helper";
import { storeSliceTime } from "./conflict";
import { searchBySingleCourseNo, storeCourseInfo } from "./search";
import { submitToNTHU } from "./select";

function getCart() {
  chrome.storage.local.get("cart", function(items) {
    let parse_table = $.parseHTML(course_table);
    $(parse_table).attr("id", "cart");

    let target_time = [];
    let count = 0;
    $("#course_order_list").empty();
    $("#course_order_list").attr("course_num", count);
    for (let key in items.cart) {
      if (items.cart.hasOwnProperty(key)) {
        count = course_order_list(key, items.cart[key], count);
        let patt = /[^A-Za-z0-9_]+/;
        let name = items.cart[key].course_name.match(patt)[0];
        let content =
          `<a href="#do_not_jump" id="` +
          key +
          `" course_no="` +
          items.cart[key].course_no +
          `">` +
          name +
          `</a>`;

        if (items.cart[key].time.length == 1) {
          $(parse_table)
            .find(".none")
            .append(content);
        } else {
          let slice_time = [];
          for (let each in items.cart[key].time) {
            let each_time = items.cart[key].time[each];
            slice_time.push(each_time);
            target_time.push(each_time);
          }

          for (let each in slice_time) {
            $(parse_table)
              .find("." + slice_time[each])
              .append(content);
          }
        }
      }
    }
    if ($("#course_order_list").attr("course_num") == 1)
      $("#course_order_list > div > .number").text("1");
    storeSliceTime(target_time);
    $("#cart").replaceWith(parse_table);
    $("#cart > tr").on("click", "td", function() {
      $("#multiple_class_list").empty();
      if ($(this).children().length > 1) {
        $("a", this).each(function() {
          let content =
            `<div id="` +
            $(this).attr("id") +
            `" course_no="` +
            $(this).attr("course_no") +
            `" class="item">
            <div class="content">
            <div class="description">` +
            $(this).text() +
            `</div>
            </div>
            </div>`;
          $("#multiple_class_list").append(content);
        });
        $("#multiple_class").modal("show");
      } else {
        let course_no = $("a", this).attr("course_no");
        let id = $("a", this).attr("id");
        getCourseInfo(
          course_no,
          id,
          function() {
            $(".course_action").hide();
            $("#delete").show();
            $("#back").show();
            $("#course_info_loading").removeClass("active");
          },
          false
        );
      }
    });
  });
}

function course_order_list(id, item, count) {
  let patt = /[^A-Za-z\\]+/;
  if (item.order > -1) {
    let content =
      `<div course_no="` +
      item.course_no +
      `" class="item">
    <div id="` +
      id +
      `" class="number right floated content">0</div>
    <div class="content">
    <div class="description">` +
      item.course_name.match(patt) +
      `</div>
    </div>
    </div>`;
    $("#course_order_list").append(content);
    count++;
    $("#course_order_list").attr("course_num", count);
  }
  return count;
}

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
$("#multiple_class_list").on("click", ".item", function() {
  let course_no = $(this).attr("course_no");
  let id = $(this).attr("id");
  getCourseInfo(
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
$("#cart_submit").on("click", function() {
  // alert("此為內部測試版本，選完課請到「預排系統」查看 !");
  let childNum = $("#course_order_list").attr("course_num");
  if (childNum > 0) {
    let list = document.getElementById("course_order_list");
    Sortable.create(list, {
      onUpdate: function() {
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
    submitToNTHU();
  }
});

export { getCart };
