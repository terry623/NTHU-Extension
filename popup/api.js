// TODO: 這些函式都要進行 Error 處理，包括 Session 及 錯誤科目
var iconv = require("iconv-lite");
var request = require("request");
import { transform } from "./pdf2html";
import { calculateUserGrade } from "./server";

function getUserName(acix) {
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
        var found = $(
          "div > form > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(4)",
          temp
        );

        var welcome = "<div>Hi~ " + found.text() + " !</div>";
        $("#user").prepend(welcome);
      }
    }
  );
}

function getPopulation(acix, course_no) {
  var patt = /[A-Za-z]+/;
  var target = course_no.match(patt);
  $("#size_limit").text("Loading");
  $("#current_number").text("Loading");
  $("#remain").text("Loading");
  $("#be_random").text("Loading");
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
        // console.log.apply(console, $(temp));

        // $("#jh_loading", temp).remove();
        var found = $("div > form > table.sortable > tbody > tr", temp).filter(
          function(index) {
            return $("td:nth-child(1) > div", this).text() == course_no;
          }
        );
        var size_limit = $("td:nth-child(5) > div", found);
        var current_number = $("td:nth-child(6) > div", found);
        var remain = $("td:nth-child(7) > div", found);
        var be_random = $("td:nth-child(8) > div", found);
        $("#size_limit").text(size_limit.text() + " 人");
        $("#current_number").text(current_number.text() + " 人");
        $("#remain").text(remain.text() + " 人");
        $("#be_random").text(be_random.text() + " 人");
      }
    }
  );
}

// FIXME: 遇到課表上空白科目會有問題
function getCourseInfo(acix, course_no, showButton) {
  if (course_no == undefined) return;
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
        // console.log("Before: " + course_no);

        if (
          $(temp)
            .text()
            .indexOf("session is interrupted!") >= 0
        ) {
          alert("請重新登入 !");
        } else if (
          $(temp)
            .text()
            .indexOf("錯誤的科目") >= 0
        ) {
          var myRe = /[0-9]+[A-Za-z]+/g;
          var myArray = myRe.exec(course_no);
          var output = [
            course_no.slice(0, myRe.lastIndex),
            course_no.slice(myRe.lastIndex)
          ].join(" ");
          // console.log("After: " + output);
          getCourseInfo(acix, output, showButton);
        } else {
          // TODO: 從 Storage API 裡面讀資料
          var no = $(
            "div > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(2)",
            temp
          );
          var name_zh = $(
            "div > table:nth-child(1) > tbody > tr:nth-child(3) > td.class3",
            temp
          );
          var name_en = $(
            "div > table:nth-child(1) > tbody > tr:nth-child(4) > td.class3",
            temp
          );
          var credit = $(
            "div > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(4)",
            temp
          );
          var teacher = $(
            "div > table:nth-child(1) > tbody > tr:nth-child(5) > td.class3",
            temp
          );
          var time = $(
            "div > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(2)",
            temp
          );
          var classroom = $(
            "div > table:nth-child(1) > tbody > tr:nth-child(6) > td:nth-child(4)",
            temp
          );
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

          getPopulation(acix, course_no);
          $("#no").text(no.text());
          $("#course_name").text(name_zh.text() + " " + name_en.text());
          $("#credit").text(credit.text());
          $("#teacher").text(teacher.text());
          $("#time").text(time.text());
          $("#classroom").text(classroom.text());
          $("#description").html(description.html());
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

          if (showButton == true) {
            $("#back").show();
            $("#submit").show();
          } else {
            $("#back").hide();
            $("#submit").hide();
          }
          $(".course_info.modal").modal("show");
        }
      }
    }
  );
}

function match_name_course(table2, con) {
  var re;
  $("tbody > tr > td:nth-child(1)", table2).each(function() {
    // console.log("Want to find: " + con);
    var parent = $(this).parent();
    var str = $("td:nth-child(2)", parent).text();
    var n = str.includes(con);
    if (n == true) {
      // console.log("I found: " + $("td:nth-child(2)", parent).text());
      re = $("td:nth-child(1)", parent).text();
      return false;
    }
  });
  return re;
}

function getResultCourse(acix, stu_no, phaseNo, year, term) {
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

        var table = $("form > table:nth-child(7)", temp);
        var table2 = $("form > table:nth-child(3)", temp);
        $("tbody > tr > td:nth-child(7)", table).remove();
        $("tbody > tr", table).removeClass("word");
        $(table)
          .find("td")
          .removeAttr("width");

        $("tbody > tr > td > div", table).each(function() {
          $(this).html(function(index, text) {
            if ($(this).find("b").length > 0) {
              var t = $("b:nth-child(2)", this).text();
              t = t.replace("全民國防教育軍事訓練--", "");
              $("b:nth-child(2)", this).text(t);
              return $(this).replaceWith(t);
            }
          });
        });

        $(table)
          .find("div")
          .removeAttr("align");
        $("tbody > tr > td", table).each(function() {
          if (!$(this).has("div").length) {
            $(this)
              .addClass("selectable")
              .html(`<a href="#do_not_jump">` + $(this).text() + `</a>`);
            var con = $(this).text();
            var found_id = match_name_course(table2, con);
            // console.log("Found id: " + found_id);
            $(this).attr("id", found_id);
          } else {
            var text = $("div", this).text();
            text = text.replace("--", "-");
            $("div", this).text(text);
          }
        });
        $("tbody > tr:nth-child(15) > td:nth-child(1)", table)
          .html("無上課時間")
          .removeClass("selectable");
        $("tbody > tr.class1", table).remove();
        if ($("#school_table").has("tbody").length) {
          $("#school_table > tbody").remove();
        }
        $("#school_table").append(table.html());
        // TODO: Add Loader
        $("#school_table > tbody > tr").on("click", "td", function() {
          getCourseInfo(acix, $(this).attr("id"), false);
        });
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
        // console.log.apply(console, $(temp));

        var allGradeOfStudent = $(
          "form > table:nth-child(4) > tbody > tr",
          temp
        );

        var userGrade = Object.create(null);
        $(allGradeOfStudent).each(function(index) {
          // console.log(index + ": " + $(this).text());
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
  );
}

export { getUserName, getCourseInfo, getResultCourse, getGrade };
