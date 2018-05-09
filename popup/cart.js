import { getCourseInfo } from "./api";
function getCart(acix) {
  const table = `<tbody id="cart">
        <tr class="">
            <td>
                <div>08:00 - 08:50</div>
            </td>
            <td class="M1 selectable"> </td>
            <td class="T1 selectable"> </td>
            <td class="W1 selectable"> </td>
            <td class="R1 selectable"> </td>
            <td class="F1 selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>09:00 - 09:50</div>
            </td>
            <td class="M2 selectable"> </td>
            <td class="T2 selectable"> </td>
            <td class="W2 selectable"> </td>
            <td class="R2 selectable"> </td>
            <td class="F2 selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>10:10 - 11:00</div>
            </td>
            <td class="M3 selectable"> </td>
            <td class="T3 selectable"> </td>
            <td class="W3 selectable"> </td>
            <td class="R3 selectable"> </td>
            <td class="F3 selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>11:10 - 12:00</div>
            </td>
            <td class="M4 selectable"> </td>
            <td class="T4 selectable"> </td>
            <td class="W4 selectable"> </td>
            <td class="R4 selectable"> </td>
            <td class="F4 selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>12:10 - 13:00</div>
            </td>
            <td class="Mn selectable"> </td>
            <td class="Tn selectable"> </td>
            <td class="Wn selectable"> </td>
            <td class="Rn selectable"> </td>
            <td class="Fn selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>13:20 - 14:10</div>
            </td>
            <td class="M5 selectable"> </td>
            <td class="T5 selectable"> </td>
            <td class="W5 selectable"> </td>
            <td class="R5 selectable"> </td>
            <td class="F5 selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>14:20 - 15:10</div>
            </td>
            <td class="M6 selectable"> </td>
            <td class="T6 selectable"> </td>
            <td class="W6 selectable"> </td>
            <td class="R6 selectable"> </td>
            <td class="F6 selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>15:30 - 16:20</div>
            </td>
            <td class="M7 selectable"> </td>
            <td class="T7 selectable"> </td>
            <td class="W7 selectable"> </td>
            <td class="R7 selectable"> </td>
            <td class="F7 selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>16:30 - 17:20</div>
            </td>
            <td class="M8 selectable"> </td>
            <td class="T8 selectable"> </td>
            <td class="W8 selectable"> </td>
            <td class="R8 selectable"> </td>
            <td class="F8 selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>17:30 - 18:20</div>
            </td>
            <td class="M9 selectable"> </td>
            <td class="T9 selectable"> </td>
            <td class="W9 selectable"> </td>
            <td class="R9 selectable"> </td>
            <td class="F9 selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>18:30 - 19:20</div>
            </td>
            <td class="Ma selectable"> </td>
            <td class="Ta selectable"> </td>
            <td class="Wa selectable"> </td>
            <td class="Ra selectable"> </td>
            <td class="Fa selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>19:30 - 20:20</div>
            </td>
            <td class="Mb selectable"> </td>
            <td class="Tb selectable"> </td>
            <td class="Wb selectable"> </td>
            <td class="Rb selectable"> </td>
            <td class="Fb selectable"> </td>
        </tr>
        <tr class="">
            <td>
                <div>20:30 - 21:20</div>
            </td>
            <td class="Mc selectable"> </td>
            <td class="Tc selectable"> </td>
            <td class="Wc selectable"> </td>
            <td class="Rc selectable"> </td>
            <td class="Fc selectable"> </td>
        </tr>
        <tr class="">
            <td>無上課時間</td>
            <td colspan="5">
            </td>
        </tr>
    </tbody>`;

  chrome.storage.sync.get("cart", function(items) {
    var parse_table = $.parseHTML(table);
    for (var key in items.cart) {
      if (items.cart.hasOwnProperty(key)) {
        var slice_time = [];
        var j = 0;
        for (var i = 0; i < items.cart[key].time.length; i = i + 2) {
          slice_time[j] = items.cart[key].time.slice(i, i + 2);
          j++;
        }

        //FIXME: 同時段的課程沒有處理
        for (var i = 0; i < slice_time.length; i++) {
          var name = items.cart[key].course_name.split(" ");
          $(parse_table)
            .find("." + slice_time[i])
            .append(`<a href="#do_not_jump">` + name[0] + `</a>`)
            .attr("id", key);
          //   console.log.apply(console, $(parse_table).find("." + slice_time[i]));
        }
      }
    }
    $("#cart").replaceWith(parse_table);
    $("#cart > tr").on("click", "td", function() {
      getCourseInfo(acix, $(this).attr("id"), false);
    });
  });
}

export { getCart };
