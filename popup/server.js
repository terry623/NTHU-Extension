var iconv = require('iconv-lite');
var request = require('request');
import { acix } from './popup';

const baseURL = `http://192.168.99.100:8080/api/`;
// const baseURL = `https://nthu3-212713.appspot.com/api/`;

function calculateUserGrade(userGrade) {
  let all_pr = {};
  for (let course_no in userGrade) {
    let grade = userGrade[course_no];
    let translateMap = {
      'A+': 0,
      A: 1,
      'A-': 2,
      'B+': 3,
      B: 4,
      'B-': 5,
      'C+': 6,
      C: 7,
      'C-': 8,
      D: 9,
      E: 10,
      X: 11,
      NotYet: 12,
      All: 13,
    };
    getGradeDistribution(course_no, distribution => {
      let user_grade_people = 0;
      for (let i = 0; i <= translateMap[grade]; i++)
        user_grade_people += distribution[i];
      let pr = 1 - user_grade_people / 100;
      all_pr[course_no] = pr;

      chrome.storage.local.get('pr', items => {
        let temp = {};
        let data = {};
        for (let each in all_pr) data[each] = all_pr[each];

        if (items.pr != undefined) {
          Object.assign(temp, items.all_pr);
          for (let each_data in data) {
            temp[each_data] = data[each_data];
          }
          chrome.storage.local.remove('pr', () => {
            chrome.storage.local.set({ pr: temp }, () => {
              chrome.storage.local.get('pr', items => {
                // console.log(items);
              });
            });
          });
        } else {
          for (let each_data in data) temp[each_data] = data[each_data];
          chrome.storage.local.set({ pr: temp }, () => {
            chrome.storage.local.get('pr', items => {
              // console.log(items);
            });
          });
        }
      });
    });
  }
}

function getGradeDistribution(course_no, callback) {
  request(
    {
      url:
        'https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/8/8.3/8.3.3/JH83302.php?ACIXSTORE=' +
        acix +
        '&c_key=' +
        course_no +
        '&from=prg8R63',
      encoding: null,
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let str = iconv.decode(new Buffer(body), 'big5');
        let replace =
          `<img border="0" src="JH833022_img.php?ACIXSTORE=` + acix + `">`;
        str = str.replace(replace, '');
        let temp = document.createElement('div');
        temp.innerHTML = str;
        // console.log.apply(console, $(temp));

        let gradeDistributionOfCourse = $(
          'form > table > tbody > tr > td > table > tbody > tr:nth-child(2) > td',
          temp
        );

        let gradeDistribution = [];
        $(gradeDistributionOfCourse).each(function(index) {
          if (index > 0) {
            let grade = $(this).text();
            let words = grade.split('%');
            let num = '0';
            if (words.length != 1) num = words[0];
            gradeDistribution.push(parseInt(num));
          }
        });
        callback(gradeDistribution);
      }
    }
  );
}

function getSimilarities(course_id, callback) {
  chrome.storage.local.get('course', items => {
    let info = items.course[course_id];
    if (info.相似課程.length == 0) {
      request(
        {
          url: baseURL + 'getSimilarities?course_id=' + course_id,
        },
        (err, response, body) => {
          if (!err && response.statusCode == 200) {
            let info = JSON.parse(body);
            let temp = {};
            Object.assign(temp, items.course);
            for (let i = 0; i < info.length; i++) {
              if (info[i].other == Number(course_id)) {
                info.splice(i, 1);
              }
            }
            temp[course_id].相似課程 = info;
            chrome.storage.local.set({ course: temp }, () => {
              chrome.storage.local.get('course', items => {
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

const getSimilarities_forRecommend = course_id =>
  new Promise(resolve => {
    request(
      {
        url: baseURL + 'getSimilarities?course_id=' + course_id,
      },
      (err, response, body) => {
        if (!err && response.statusCode == 200) {
          let info = JSON.parse(body);
          resolve(info);
        }
      }
    );
  });

function currentPhase(phase) {
  $('#change_phase')
    .find('.item')
    .filter(function(index) {
      return index > phase;
    })
    .addClass('disabled');

  //  選課紀錄
  //  000  第 1 次選課
  //  100  第 1 次選課 log 記錄
  //  100P 第 1 次選課亂數結果

  // / 000  第 2 次選課
  //  101  第 2 次選課 log 記錄
  //  101P 第 2 次選課結束(已亂數處理)

  //  000  第 3 次選課
  //  200  第 3 次選課 log 記錄
  //  200P 第 3 次選課結束(已亂數處理)

  //  200S 加退選開始前(含擋修、衝堂)
  //  300  加退選 log 記錄
  //  300P 加退選結束(已處理)
  //  400  停修 log 記錄
  let tran_phase;
  let default_text;
  switch (phase) {
    case 1:
      tran_phase = '100';
      default_text = '第 1 次選課 log 記錄';
      break;
    case 2:
      tran_phase = '100P';
      default_text = '第 1 次選課結束(已亂數處理)';
      break;
    case 4:
      tran_phase = '101';
      default_text = '第 2 次選課 log 記錄';
      break;
    case 5:
      tran_phase = '101P';
      default_text = '第 2 次選課結束(已亂數處理)';
      break;
    case 7:
      tran_phase = '200';
      default_text = '第 3 次選課 log 記錄';
      break;
    case 8:
      tran_phase = '200P';
      default_text = '第 3 次選課結束(已亂數處理)';
      break;
    case 9:
      tran_phase = '200S';
      default_text = '加退選開始前(含擋修、衝堂)';
    case 10:
      tran_phase = '300';
      default_text = '加退選 log 記錄';
      break;
    case 11:
      tran_phase = '300P';
      default_text = '加退選結束(已處理)';
    case 12:
      tran_phase = '400';
      default_text = '停修 log 記錄';
  }
  $('#change_phase_text').text(default_text);
  return tran_phase;
}

const getCurrentStateOfNTHU = () =>
  new Promise(resolve => {
    let datetime = new Date();
    let year = datetime.getFullYear();
    let month = datetime.getMonth() + 1;
    let day = datetime.getDate();
    request(
      {
        url: `${baseURL}getCurrentStateOfNTHU?year=${year}&month=${month}&day=${day}`,
      },
      (err, response, body) => {
        if (!err && response.statusCode == 200) {
          let info = JSON.parse(body);
          let phase = parseInt(info.currentPhase);
          let tran_phase = currentPhase(phase);
          let countDown = parseInt(info.countDown);
          $('#count_down').text(`${countDown} days`);

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
          let count_down_text;
          if (info.currentPhase != 'too_early') {
            switch (phase) {
              case 1:
                count_down_text = '離第一次選課結束';
                break;
              case 2:
                count_down_text = '離第二次選課開始';
                break;
              case 4:
                count_down_text = '離第二次選課結束';
                break;
              case 5:
                count_down_text = '離第三次選課開始';
                break;
              case 7:
                count_down_text = '離第三次選課結束';
                break;
              default:
                count_down_text = '加退選';
                $('#count_down').text('0 days');
                break;
            }
          } else count_down_text = '離第一次選課開始';

          $('#count_down_text').text(count_down_text);
          resolve(tran_phase);
        }
      }
    );
  });

function saveUserGrade(userGrade) {
  request.post(
    {
      url: `${baseURL}saveUserGrade`,
      form: {
        userGrade: JSON.stringify(userGrade),
      },
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let resp = JSON.parse(body);
        console.log(resp.message);
      }
    }
  );
}
export {
  calculateUserGrade,
  getSimilarities,
  getCurrentStateOfNTHU,
  getSimilarities_forRecommend,
  saveUserGrade,
  baseURL,
};
