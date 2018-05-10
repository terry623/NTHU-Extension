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
  $("#search_result_body").empty();
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
        storeCourseInfo(hits);
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
        // FIXME: 寫在函式裡的 jquery，可能被創造好幾次
        $("#search_result_body > tr").hover(function() {
          $(this).css("cursor", "pointer");
        });
      },
      function(err) {
        console.trace(err.message);
      }
    );
}

function storeCourseInfo(hits, num) {
  chrome.storage.local.get("course", function(items) {
    var temp = {};
    var data = {};
    for (var each_course in hits) {
      var each = hits[each_course]._source;

      //   授課語言: each.授課語言,
      data[each.科號] = {
        不可加簽說明: each.不可加簽說明,
        人限: each.人限,
        備註: each.備註,
        學分數: each.學分數,
        授課語言: each.授課語言,
        擋修說明: each.擋修說明,
        新生保留人數: each.新生保留人數,
        科號: each.科號,
        課程中文名稱: each.課程中文名稱,
        課程英文名稱: each.課程英文名稱,
        課程限制說明: each.課程限制說明,
        通識對象: each.通識對象,
        通識類別: each.通識類別,
        開課代碼: each.開課代碼,
        教師: each.教師,
        教室: each.教室,
        時間: each.時間,
        學程: each.學程,
        必選修: each.必選修,
        第一二專長: each.第一二專長
      };
    }

    if (items.course != undefined) {
      Object.assign(temp, items.course);
      for (var each_data in data) temp[data[each_data].科號] = data[each_data];

      chrome.storage.local.remove("course", function() {
        chrome.storage.local.set({ course: temp }, function() {
          chrome.storage.local.get("course", function(items) {
            console.log("In Storage");
            console.log(items);
          });
        });
      });
    } else {
      for (var each_data in data) temp[data[each_data].科號] = data[each_data];

      chrome.storage.local.set({ course: temp }, function() {
        chrome.storage.local.get("course", function(items) {
          console.log("In Storage");
          console.log(items);
        });
      });
    }
  });
}

export { searchByKeyword };
