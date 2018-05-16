import { getCourseInfo } from "./api";
import { course_table } from "./helper";

function getCart(acix) {
  chrome.storage.local.get("cart", function(items) {
    var parse_table = $.parseHTML(course_table);
    $(parse_table).attr("id", "cart");

    for (var key in items.cart) {
      if (items.cart.hasOwnProperty(key)) {
        var name = items.cart[key].course_name.split(" ");

        //FIXME: 同時段的課程沒有處理
        if (items.cart[key].time.length == 1) {
          $(parse_table)
            .find(".none")
            .append(`<a href="#do_not_jump">` + name[0] + `</a>`)
            .attr("id", key)
            .attr("course_no", items.cart[key].course_no);
        } else {
          var slice_time = [];
          for (
            var i = 0, j = 0;
            i < items.cart[key].time.length;
            i = i + 2, j++
          ) {
            slice_time[j] = items.cart[key].time.slice(i, i + 2);
          }
          for (var i = 0; i < slice_time.length; i++) {
            $(parse_table)
              .find("." + slice_time[i])
              .append(`<a href="#do_not_jump">` + name[0] + `</a>`)
              .attr("id", key)
              .attr("course_no", items.cart[key].course_no);
          }
        }
      }
    }
    $("#cart").replaceWith(parse_table);
    $("#cart > tr").on("click", "td", function() {
      getCourseInfo(
        acix,
        $(this).attr("course_no"),
        $(this).attr("id"),
        false,
        function() {
          $("#course_info_loading").removeClass("active");
        }
      );
    });
  });
}

export { getCart };
