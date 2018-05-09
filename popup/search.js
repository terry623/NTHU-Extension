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
        $("#search_result_body > tr").hover(function() {
          $(this).css("cursor", "pointer");
        });
        $("#search_result_body > tr").click(function() {
          $(this).css("cursor", "pointer");
          var course_from_click = $("td:nth-child(1)", this).text();
          console.log(course_from_click);
          getCourseInfo(acix, course_from_click, true);
        });
      },
      function(err) {
        console.trace(err.message);
      }
    );
}

export { searchByKeyword };
