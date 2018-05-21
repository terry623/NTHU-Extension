import { Server } from "tls";

var request = require("request");

function calculateUserGrade(stu_no, userGrade) {
  request.post(
    {
      url: "http://127.0.0.1:5000/api/calculateUserGrade",
      form: {
        stu_no: stu_no,
        userGrade: JSON.stringify(userGrade)
      }
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        // console.log(body);
      }
    }
  );
}

function collectionOfCourse() {
  var obj = {
    values: []
  };
  const local_course = [
    {
      value: "課程編號1",
      text: "選項1",
      name: "選項詳情1"
    },
    {
      value: "課程編號2",
      text: "選項2",
      name: "選項詳情2"
    },
    {
      value: "課程編號3",
      text: "選項3",
      name: "選項詳情3"
    }
  ];
  for (var v in local_course) {
    obj.values[v] = {
      value: local_course[v].value,
      text: local_course[v].text,
      name: local_course[v].name
    };
  }
  $(".ui.dropdown.search_list_1").dropdown("refresh");
  $(".ui.dropdown.search_list_1").dropdown("setup menu", obj);
}

function getSimilarities(course_id, callback) {
  chrome.storage.local.get("course", function(items) {
    var info = items.course[course_id];
    if (info.相似課程.length == 0) {
      request(
        {
          url:
            "http://127.0.0.1:5000/api/getSimilarities?course_id=" + course_id
        },
        function(err, response, body) {
          if (!err && response.statusCode == 200) {
            var info = JSON.parse(body);
            var temp = {};
            Object.assign(temp, items.course);
            temp[course_id].相似課程 = info;
            chrome.storage.local.set({ course: temp }, function() {
              chrome.storage.local.get("course", function(items) {
                // console.log(items);
              });
            });
            callback(info);
          }
        }
      );
    } else callback(info.相似課程);
  });
}

function currentPhase(phase) {
  $("#change_phase")
    .find(".item")
    .filter(function(index) {
      return index > phase;
    })
    .addClass("disabled");

  //  選課紀錄
  //  000  第 1 次選課
  //  100  第 1 次選課 log 記錄
  //  100P 第 1 次選課亂數結果

  /// 000  第 2 次選課
  //  101  第 2 次選課 log 記錄
  //  101P 第 2 次選課結束(已亂數處理)

  //  000  第 3 次選課
  //  200  第 3 次選課 log 記錄
  //  200P 第 3 次選課結束(已亂數處理)

  //  200S 加退選開始前(含擋修、衝堂)
  //  300  加退選 log 記錄
  //  300P 加退選結束(已處理)
  //  400  停修 log 記錄
  var tran_phase;
  var default_text;
  switch (phase) {
    case 1:
      tran_phase = "100";
      default_text = "第 1 次選課 log 記錄";
      break;
    case 2:
      tran_phase = "100P";
      default_text = "第 1 次選課亂數結果";
      break;
    case 4:
      tran_phase = "101";
      default_text = "第 2 次選課 log 記錄";
      break;
    case 5:
      tran_phase = "101P";
      default_text = "第 2 次選課 log 記錄";
      break;
    case 7:
      tran_phase = "200";
      default_text = "第 3 次選課 log 記錄";
      break;
    case 8:
      tran_phase = "200P";
      default_text = "第 3 次選課結束(已亂數處理)";
      break;
    case 9:
      tran_phase = "200S";
      default_text = "加退選開始前(含擋修、衝堂)";
    case 10:
      tran_phase = "300";
      default_text = "加退選 log 記錄";
      break;
    case 11:
      tran_phase = "300P";
      default_text = "加退選結束(已處理)";
    case 12:
      tran_phase = "400";
      default_text = "停修 log 記錄";
  }
  $("#change_phase_text").text(default_text);
  return tran_phase;
}

function getCurrentStateOfNTHU(callback) {
  request(
    {
      url: "http://127.0.0.1:5000/api/getCurrentStateOfNTHU"
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var info = JSON.parse(body);
        // TODO: 日期要多測試
        var phase = parseInt(info.currentPhase);
        var tran_phase = currentPhase(phase);
        var countDown = parseInt(info.countDown);
        $("#count_down").text(countDown + " days");

        //  加退選之後日期都沒考慮
        //  1  第 1 次選課 log 記錄
        //  2  第 1 次選課亂數結果
        //  4  第 2 次選課 log 記錄
        //  5  第 2 次選課結束(已亂數處理)
        //  7  第 3 次選課 log 記錄
        //  8  第 3 次選課結束(已亂數處理)
        //  9  加退選開始前(含擋修、衝堂)
        //  10 加退選 log 記錄
        //  11 加退選結束(已處理)
        //  12 停修 log 記錄
        var count_down_text;
        if (info.currentPhase != "too_early") {
          switch (phase) {
            case 1:
              count_down_text = "離第一次選課結束";
              break;
            case 2:
              count_down_text = "離第二次選課開始";
              break;
            case 4:
              count_down_text = "離第二次選課結束";
              break;
            case 5:
              count_down_text = "離第三次選課開始";
              break;
            case 7:
              count_down_text = "離第三次選課結束";
              break;
            default:
              count_down_text = "加退選";
              $("#count_down").text("0 days");
              break;
          }
        } else count_down_text = "離第一次選課開始";

        $("#count_down_text").text(count_down_text);
        callback(tran_phase);
      }
    }
  );
}

export {
  calculateUserGrade,
  collectionOfCourse,
  getSimilarities,
  getCurrentStateOfNTHU
};
