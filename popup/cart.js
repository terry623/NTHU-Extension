import { getCourseInfo } from "./api";
import { course_table } from "./helper";

function getCart(acix) {
  chrome.storage.local.get("cart", function(items) {
    var parse_table = $.parseHTML(course_table);
    $(parse_table).attr("id", "cart");

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
          }
          for (var i = 0; i < slice_time.length; i++) {
            $(parse_table)
              .find("." + slice_time[i])
              .append(content);
          }
        }
      }
    }
    $("#cart").replaceWith(parse_table);
    //TODO: 通識的話，可以在此 modal 看志願
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
          // console.log.apply(console, $(this));
          $("#multiple_class_list").append(content);
        });
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
