var iconv = require("iconv-lite");
var request = require("request");
import { transform } from "./pdf2html";
import { WSAEPROVIDERFAILEDINIT } from "constants";

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
        $(".content_item.homePage").show();
      }
    }
  );
}

function getPopulation(acix, course_no) {
  var patt = /[A-Za-z]+/;
  var target = course_no.match(patt);

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
        var temp = document.createElement("div");
        temp.innerHTML = str;
        // console.log.apply(console, $(temp));

        var found = $("div > form > table.sortable > tbody > tr", temp).filter(
          function(index) {
            return $("td:nth-child(1) > div", this).text() == course_no;
          }
        );
        var word = $("td:nth-child(6) > div", found);
        $("#population").text("修課人數: " + word.text());
      }
    }
  );
}

function getCourseInfo(acix, course_no) {
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

        // TODO:數據抓很久，可以用個 Loader 再一起顯示
        // getPopulation(acix, course_no);

        $("#no").text(no.text());
        $("#course_name").prepend(name_zh.text() + " " + name_en.text());
        $("#teacher").text(teacher.text());
        $("#time").text(time.text());
        $("#classroom").text(classroom.text());
        $("#description").append(description.html());

        if (find_file.length > 0) {
          var pdf_path =
            "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/output/6_6.1_6.1.12/";
          $("#pdf_page").append(
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

          // TODO:看 PDF 可不可以放大
          transform(pdf_path + course_no + ".pdf?ACIXSTORE=" + acix);
        } else {
          $("#syllabus").append(syllabus.html());
        }
      }
    }
  );
}

// FIXME:一開始會同時秀出兩個 Tab 的課表
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

        var table = $("form > table:nth-child(7) > tbody", temp);
        $("tr > td:nth-child(7)", table).remove();
        $("tr", table).removeClass("word");
        $(table)
          .find("td")
          .removeAttr("width");
        $("tr > td > div", table).each(function() {
          $(this).html(function(index, text) {
            if ($(this).find("b").length > 0) {
              return $(this).replaceWith(
                $(this)
                  .find("b:nth-child(2)")
                  .text()
              );
            }
          });
        });
        $(table)
          .find("div")
          .removeAttr("align");
        $("tr:nth-child(15) > td:nth-child(1)", table).text("無上課時間");
        $("tr.class1", table).remove();
        $("tr > td > div", table).each(function() {
          var text = $(this).text();
          text = text.replace("--", "-");
          $(this).text(text);
        });
        $("#table").append(table.html());
      }
    }
  );
}

// TODO:成績已彙整好，但還沒有送去 Server 端
function getGrade(acix) {
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

        var userGradeMap = new Map();
        $(allGradeOfStudent).each(function(index) {
          // console.log(index + ": " + $(this).text());
          if (index > 2 && index < allGradeOfStudent.length - 1) {
            var getCourseNo = $("td:nth-child(3)", this).text();
            var getCourseGrade = $("td:nth-child(6)", this).text();
            if (!getCourseGrade.includes("Grade Not Submitted"))
              userGradeMap.set(getCourseNo, getCourseGrade);
          }
        });

        console.log("Get Grade...");
        for (var [key, value] of userGradeMap) {
          console.log(key + " : " + value);
        }
      }
    }
  );
}

function getGradeDistribution(acix, course_no) {
  request(
    {
      url:
        "https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/8/8.3/8.3.3/JH83302.php?ACIXSTORE=" +
        acix +
        "&c_key=" +
        course_no +
        "&from=prg8R63",
      encoding: null
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var str = iconv.decode(new Buffer(body), "big5");
        var temp = document.createElement("div");
        temp.innerHTML = str;
        // console.log.apply(console, $(temp));

        var gradeDistributionOfCourse = $(
          "form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td",
          temp
        );

        var gradeDistributionMap = new Map();
        $(gradeDistributionOfCourse).each(function(index) {
          if (index > 0) {
            var grade = $(this).text();
            var words = grade.split("%");
            var num = 0;
            var patt = /\d+/;

            if (words[1] != undefined) num = words[1].match(patt);
            gradeDistributionMap.set(index, num);
          }
        });

        console.log("Get Grade Distribution...\n");
        for (var [key, value] of gradeDistributionMap) {
          console.log(key + " : " + value);
        }
      }
    }
  );
}
export {
  getUserName,
  getCourseInfo,
  getResultCourse,
  getGrade,
  getGradeDistribution
};
