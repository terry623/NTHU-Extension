import { getCourseInfo } from "./api";
import { course_table } from "./helper";
import { storeSliceTime } from "./conflict";

function getCart(acix) {
  chrome.storage.local.get("cart", function(items) {
    var parse_table = $.parseHTML(course_table);
    $(parse_table).attr("id", "cart");

    var all_time = [];
    for (var key in items.cart) {
      if (items.cart.hasOwnProperty(key)) {
        var name = items.cart[key].course_name.split(" ");
        var content =
          `<a href="#do_not_jump" id="` +
          key +
          `" course_no="` +
          items.cart[key].course_no +
          `">` +
          name[0] +
          `</a>`;

        if (items.cart[key].time.length == 1) {
          $(parse_table)
            .find(".none")
            .append(content);
        } else {
          var slice_time = [];
          for (
            var i = 0, j = 0;
            i < items.cart[key].time.length;
            i = i + 2, j++
          ) {
            slice_time[j] = items.cart[key].time.slice(i, i + 2);
            all_time.push(slice_time[j]);
          }
          for (var i = 0; i < slice_time.length; i++) {
            $(parse_table)
              .find("." + slice_time[i])
              .append(content);
          }
        }
      }
    }
    storeSliceTime(all_time, "from_cart");
    $("#cart").replaceWith(parse_table);
    $("#cart > tr").on("click", "td", function() {
      $("#multiple_class_list").empty();
      if ($(this).children().length > 1) {
        $("a", this).each(function() {
          var content =
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

        //TODO: 通識的話，可以在此 modal 看志願
        $("#multiple_class").modal("show");
      } else {
        var course_no = $("a", this).attr("course_no");
        var id = $("a", this).attr("id");
        getCourseInfo(acix, course_no, id, function() {
          $(".course_action").hide();
          $("#delete").show();
          $("#back").show();
          $("#course_info_loading").removeClass("active");
        });
      }
    });
  });
}

export { getCart };
