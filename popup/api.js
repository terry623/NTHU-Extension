// TODO: 這些函式都要進行 Error 處理
var iconv = require("iconv-lite");
var request = require("request");
import { transform } from "./pdf2html";
import { calculateUserGrade, getSimilarities } from "./server";
import { searchBySingleCourseNo } from "./search";
import { course_table, removeLongCourseName } from "./helper";

function getUserName(acix, callback) {
  $("#home_loading").addClass("active");
  request(
    {
      url:
        "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/4/4.19/JH4j002.php?ACIXSTORE=" +
        acix,
      encoding: null
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var str = iconv.decode(new Buffer(body), "big5");
        var temp = document.createElement("div");
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf("session is interrupted!") >= 0
        ) {
          $("#session_alert").modal("show");
        } else {
          var found = $(
            "div > form > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(4)",
            temp
          );
          var welcome = "你選到好課了嗎，" + found.text() + " ?";
          $("#user").prepend(welcome);
          callback();
        }
      }
    }
  );
}

// FIXME: 通識多了向度，所以抓取人數會跑掉，可以改成對應欄位名字
function getPopulation(acix, course_no, fresh_num) {
  var patt = /[A-Za-z]+/;
  var target = course_no.match(patt);
  $(".fetch_people").text("Loading");

  request.post(
    {
      url:
        "https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.2/7.2.7/JH727002.php",
      form: {
        ACIXSTORE: acix,
        select: target[0],
        act: "1",
        Submit: "確定 go"
      },
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      encoding: null,
      method: "POST"
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var str = iconv.decode(new Buffer(body), "big5");
        str = str.replace(
          "<img id='jh_loading' src='/style/JH/jh_loading.gif' style='position:fixed;'>",
          ""
        );
        var temp = document.createElement("div");
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf("session is interrupted!") >= 0
        ) {
          $("#session_alert").modal("show");
        } else {
          var found = $(
            "div > form > table.sortable > tbody > tr",
            temp
          ).filter(function(index) {
            return $("td:nth-child(1) > div", this).text() == course_no;
          });

          $("#size_limit").text($("td:nth-child(5) > div", found).text());
          $("#current_number").text($("td:nth-child(6) > div", found).text());
          $("#remain").text($("td:nth-child(7) > div", found).text());
          $("#be_random").text($("td:nth-child(8) > div", found).text());
          $("#fresh_num").text(fresh_num);
        }
      }
    }
  );
}

function getCourseInfo(acix, course_no, id, callback) {
  if (course_no == undefined) return;
  $("#course_info_loading").addClass("active");
  request(
    {
      url:
        "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/common/Syllabus/1.php?ACIXSTORE=" +
        acix +
        "&c_key=" +
        course_no,
      encoding: null
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var str = iconv.decode(new Buffer(body), "big5");
        var temp = document.createElement("div");
        temp.innerHTML = str;
        // console.log.apply(console, $(temp));

        if (
          $(temp)
            .text()
            .indexOf("session is interrupted!") >= 0
        ) {
          $("#session_alert").modal("show");
        } else {
          chrome.storage.local.get("course", function(items) {
            getSimilarities(id, function(info) {
              $("#similar").empty();
              for (var each in info) {
                var similar_course =
                  `<div class="title">
                    <i class="dropdown icon"></i>` +
                  info[each].sim.other +
                  `</div>
                <div class="content">` +
                  info[each].sim.percent +
                  `</div>`;
                $("#similar").append(similar_course);
              }
            });

            var info = items.course[id];
            var description = $(
              "div > table:nth-child(4) > tbody > tr:nth-child(2) > td",
              temp
            );
            var syllabus = $(
              "div > table:nth-child(5) > tbody > tr:nth-child(2) > td",
              temp
            );
            var find_file = $(
              "div > table:nth-child(5) > tbody > tr:nth-child(2) > td > div > font:nth-child(1) > a",
              temp
            );

            var time = info.時間;
            var classroom = info.教室;
            if (time == "") time = "無";
            if (classroom == "") classroom = "無";
            getPopulation(acix, course_no, info.新生保留人數);
            $(".ui.piled.segment").attr("id", id);

            var teacher = [];
            for (var each in info.教師)
              teacher.push(info.教師[each].split("\t")[0]);
            teacher.splice(-1, 1);
            $("#teacher").text(teacher.join(" / "));

            $("#no").text(info.科號);
            $("#course_name").text(info.課程中文名稱 + " " + info.課程英文名稱);
            $("#credit").text(info.學分數);
            $("#time").text(time);
            $("#classroom").text(classroom);
            $("#description").html(description.html());

            $("#block_rule").html(info.擋修說明);
            $("#limit_rule").html(info.課程限制說明);
            $("#join_limit").html(info.不可加簽說明);
            $("#ps").html(info.備註);
            $("#GE_people").html(info.通識對象);
            $("#GE_type").html(info.通識類別);

            $("#must_choose").html(info.必選修.join("<br>"));
            $("#program").html(info.學程.join("<br>"));
            $("#skill").html(info.第一二專長.join("<br>"));

            $("#pdf_page").empty();
            $("#syllabus").empty();

            if (find_file.length > 0) {
              var ran = Math.floor(Math.random() * 100 + 1);
              var pdf_path =
                "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/output/6_6.1_6.1.12/";
              $("#pdf_page").html(
                `<div align="right">
                        <button id="prev" class="tiny ui basic button">
                            <i class="angle left icon"></i>
                        </button>
                        <button id="next" class="tiny ui basic button">
                            <i class="angle right icon"></i>
                        </button>
                        &nbsp; &nbsp;
                        <span>Page:
                            <span id="page_num"></span> /
                            <span id="page_count"></span>
                        </span>
                    </div>
                    <canvas id="the-canvas" />
                    `
              );
              transform(pdf_path + course_no + ".pdf?ACIXSTORE=" + acix);
            } else $("#syllabus").html(syllabus.html());

            for (var i = 0; i < $("#class_accordion > div").length / 2; i++)
              $(".ui.accordion").accordion("close", i);

            $(".course_info.modal").modal("show");
            callback();
          });
        }
      }
    }
  );
}

function getResultCourse(acix, stu_no, phaseNo, year, term, callback) {
  if (callback) $("#course_result_loading").addClass("active");
  request.post(
    {
      url:
        "https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.2/7.2.9/JH729002.php",
      form: {
        ACIXSTORE: acix,
        stu_no: stu_no,
        phaseNo: phaseNo,
        year: year,
        term: term
      },
      encoding: null
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var str = iconv.decode(new Buffer(body), "big5");
        var temp = document.createElement("div");
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf("session is interrupted!") >= 0
        ) {
          $("#session_alert").modal("show");
        } else {
          var table = $("form > table:nth-child(3)", temp);

          var parse_table = $.parseHTML(course_table);
          $(parse_table).attr("id", "course_result_from_nthu");

          $("tbody > tr", table).each(function() {
            if ($(this).index() > 0) {
              var course_no = $("td:nth-child(1)", this).text();
              var course_name = $("td:nth-child(2)", this)
                .text()
                .split(/[A-Za-z]+/)[0];
              course_name = removeLongCourseName(course_name);
              var time = $("td:nth-child(4)", this).text();

              if (time.length == 1) {
                $(parse_table)
                  .find(".none")
                  .append(`<a href="#do_not_jump">` + course_name + `</a>`)
                  .attr("course_no", course_no);
              } else {
                var slice_time = [];
                for (var i = 0, j = 0; i < time.length; i = i + 2, j++) {
                  slice_time[j] = time.slice(i, i + 2);
                }
                for (var i = 0; i < slice_time.length; i++) {
                  $(parse_table)
                    .find("." + slice_time[i])
                    .append(`<a href="#do_not_jump">` + course_name + `</a>`)
                    .attr("course_no", course_no);
                }
              }
            }
          });
          $("#course_result_from_nthu").replaceWith(parse_table);
          $("#course_result_from_nthu > tr").on("click", "td", function() {
            searchBySingleCourseNo(acix, $(this).attr("course_no"));
          });
          if (callback) callback();
        }
      }
    }
  );
}

function getGrade(acix, stu_no) {
  request(
    {
      url:
        "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/8/R/6.3/JH8R63002.php?ACIXSTORE=" +
        acix,
      encoding: null
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var str = iconv.decode(new Buffer(body), "big5");
        var temp = document.createElement("div");
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf("session is interrupted!") >= 0
        ) {
          $("#session_alert").modal("show");
        } else {
          var allGradeOfStudent = $(
            "form > table:nth-child(4) > tbody > tr",
            temp
          );
          var userGrade = Object.create(null);
          $(allGradeOfStudent).each(function(index) {
            if (index > 2 && index < allGradeOfStudent.length - 1) {
              var getCourseNo = $("td:nth-child(3)", this).text();
              var getCourseGrade = $("td:nth-child(6)", this).text();
              if (!getCourseGrade.includes("Grade Not Submitted"))
                userGrade[getCourseNo.trim()] = getCourseGrade.trim();
            }
          });
          calculateUserGrade(stu_no, userGrade);
        }
      }
    }
  );
}

export { getUserName, getCourseInfo, getResultCourse, getGrade };
