import { getCourseInfo } from "./api";
var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
  host: "http://localhost:9200"
});
client.ping(
  {
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
  },
  function(error) {
    if (error) {
      console.trace("Elasticsearch cluster is down");
    } else {
      console.log("Elasticsearch is well");
    }
  }
);

function searchByKeyword(acix, keyword) {
  client
    .search({
      index: "nthu",
      type: "course",
      body: {
        from: 1,
        size: 10,
        query: {
          match: {
            課程中文名稱: keyword
          }
        }
      }
    })
    .then(
      function(resp) {
        var hits = resp.hits.hits;
        console.log(hits);
        for (var each_course in hits) {
          // storeCourseInfo(each_course);

          var source = hits[each_course]._source;
          var time = source.時間;
          if (time == "") time = "無";
          var classroom = source.教室;
          if (classroom == "") classroom = "無";

          var row =
            `<tr>
              <td>` +
            source.科號 +
            `</td>
              <td>` +
            source.課程中文名稱 +
            `</td>
              <td>` +
            time +
            `</td>
              <td>` +
            classroom +
            `</td>
              <td>`;

          var teacher = [];
          for (var each_teacher in source.教師)
            teacher.push(source.教師[each_teacher].split("\t")[0]);
          teacher.splice(-1, 1);
          row += teacher.join("<br>") + `</td></tr>`;
          $("#search_result_body").append($.parseHTML(row));
        }

        // FIXME: 寫在函式裡的 jquery，可能被創造好幾次
      },
      function(err) {
        console.trace(err.message);
      }
    );
}

// function storeCourseInfo(each_course) {
//   chrome.storage.sync.get("course", function(items) {
//     var temp = {};
//     var data = {
//       course_name: $("#course_name").text(),
//       time: $("#time").text()
//     };

//     if (items.cart != undefined) {
//       Object.assign(temp, items.cart);
//       temp[$("#no").text()] = data;

//       chrome.storage.sync.remove("cart", function() {
//         chrome.storage.sync.set({ cart: temp }, function() {
//           chrome.storage.sync.get("cart", function(items) {
//             // console.log(items);
//             getCart(acix);
//           });
//         });
//       });
//     } else {
//       temp[$("#no").text()] = data;
//       chrome.storage.sync.set({ cart: temp }, function() {
//         chrome.storage.sync.get("cart", function(items) {
//           // console.log(items);
//           getCart(acix);
//         });
//       });
//     }
//   });
// }

export { searchByKeyword };
