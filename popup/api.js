var iconv = require('iconv-lite');
var request = require('request');
import { transform } from './pdf2html';
import { calculateUserGrade, getSimilarities } from './server';
import { searchBySingleCourseNo, storeCourseInfo } from './search';
import {
  course_table,
  removeLongCourseName,
  sort_weekday,
  miniMessageAlert,
} from './helper';
import { acix, stu_no, year, semester } from './popup';

function renderUserName() {
  request(
    {
      url: `https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/4/4.19/JH4j002.php?ACIXSTORE=${acix}`,
      encoding: null,
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let str = iconv.decode(new Buffer(body), 'big5');
        let temp = document.createElement('div');
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf('session is interrupted!') >= 0
        ) {
          miniMessageAlert('系統錯誤', '請登入或重新登入校務資訊系統');
        } else {
          let found = $(
            'div > form > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(4)',
            temp
          );
          let welcome = `你選到好課了嗎，${found.text()} ?`;
          $('#user').prepend(welcome);
        }
      }
    }
  );
}

// FIXME: #size_limit 若有兩數字，例如 70/70，斜線後面便為新生保留人數。因此要把參數 fresh_num 拿掉。
function getPopulation(course_no, fresh_num) {
  let patt = /[A-Za-z]+/;
  let target = course_no.match(patt);
  $('.fetch_people').text('Loading');

  request.post(
    {
      url:
        'https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.2/7.2.7/JH727002.php',
      form: {
        ACIXSTORE: acix,
        select: target[0],
        act: '1',
        Submit: '確定 go',
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      encoding: null,
      method: 'POST',
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let str = iconv.decode(new Buffer(body), 'big5');
        str = str.replace(
          "<img id='jh_loading' src='/style/JH/jh_loading.gif' style='position:fixed;'>",
          ''
        );
        let temp = document.createElement('div');
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf('session is interrupted!') >= 0
        ) {
          miniMessageAlert('系統錯誤', '請登入或重新登入校務資訊系統');
        } else {
          let found = $(
            'div > form > table.sortable > tbody > tr',
            temp
          ).filter(function() {
            return $('td:nth-child(1) > div', this).text() == course_no;
          });

          if ($(found).length == 0) $('.fetch_people').text('None');
          else {
            if (target[0] == 'GE' || target[0] == 'GEC') {
              $('#size_limit').text($('td:nth-child(6) > div', found).text());
              $('#current_number').text(
                $('td:nth-child(7) > div', found).text()
              );
              $('#remain').text($('td:nth-child(8) > div', found).text());
              $('#be_random').text($('td:nth-child(9) > div', found).text());
            } else {
              $('#size_limit').text($('td:nth-child(5) > div', found).text());
              $('#current_number').text(
                $('td:nth-child(6) > div', found).text()
              );
              $('#remain').text($('td:nth-child(7) > div', found).text());
              $('#be_random').text($('td:nth-child(8) > div', found).text());
            }
            $('#fresh_num').text(fresh_num);
          }
        }
      }
    }
  );
}

function getCourseInfo(course_no, id, callback, from_multiple) {
  if (course_no == undefined) return;
  if (!from_multiple) $('#loading').addClass('active');
  request(
    {
      url: `https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/common/Syllabus/1.php?ACIXSTORE=${acix}&c_key=${course_no}`,
      encoding: null,
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let str = iconv.decode(new Buffer(body), 'big5');
        let temp = document.createElement('div');
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf('session is interrupted!') >= 0
        ) {
          miniMessageAlert('系統錯誤', '請登入或重新登入校務資訊系統');
        } else {
          chrome.storage.local.get('course', items => {
            getSimilarities(id, info => {
              $('#similar').empty();
              for (let each of info) {
                let similar_course =
                  `<div class="title">
                    <i class="dropdown icon"></i>` +
                  each.other +
                  `</div>
                <div class="content">` +
                  each.percent +
                  `</div>`;
                $('#similar').append(similar_course);
              }
            });

            let info = items.course[id];
            let description = $(
              'div > table:nth-child(4) > tbody > tr:nth-child(2) > td',
              temp
            );
            let syllabus = $(
              'div > table:nth-child(5) > tbody > tr:nth-child(2) > td',
              temp
            );
            let find_file = $(
              'div > table:nth-child(5) > tbody > tr:nth-child(2) > td > div > font:nth-child(1) > a',
              temp
            );

            let time = info.時間;
            if (time.length == 0) time.push('無');
            sort_weekday(time);
            let classroom = info.教室;
            if (classroom.length == 0) classroom.push('無');
            getPopulation(course_no, info.新生保留人數);
            $('.course_info.scrolling.content').attr('id', id);

            let teacher = [];
            for (let each of info.教師) teacher.push(each.split('\t')[0]);
            teacher.splice(-1, 1);
            if (teacher.length == 0) $('#teacher').text('None');
            else $('#teacher').text(teacher.join(' / '));

            $('#no').text(info.科號);
            $('#course_name').html(
              `${info.課程中文名稱}&nbsp;&nbsp;${info.課程英文名稱}`
            );
            $('#credit').text(info.學分數);
            $('#time').text(time);
            $('#classroom').text(classroom.join(' / '));
            $('#description').html(description.html());

            $('#block_rule').html(info.擋修說明);
            $('#limit_rule').html(info.課程限制說明);
            $('#join_limit').html(info.不可加簽說明);
            $('#ps').html(info.備註);
            $('#GE_people').html(info.通識對象);
            $('#GE_type').html(info.通識類別);

            $('#must_choose').html(info.必選修.join('<br>'));
            $('#program').html(info.學程.join('<br>'));
            $('#skill').html(info.第一二專長.join('<br>'));

            $('#pdf_page').empty();
            $('#syllabus').empty();

            if (find_file.length > 0) {
              let pdf_path =
                'https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/output/6_6.1_6.1.12/';
              $('#pdf_page').html(
                `<div id="pdf_render" align="right" style="display:none;">
                    <button id="prev" class="tiny ui basic button">
                        <i class="angle left icon"></i>
                    </button>
                    <button id="next" class="tiny ui basic button">
                        <i class="angle right icon"></i>
                    </button>
                    &nbsp; &nbsp;
                    <span>Page:
                        <span id="page_num" ></span> /
                        <span id="page_count"></span>
                    </span>
                </div>
                <canvas id="the-canvas" />
                `
              );
              transform(`${pdf_path}${course_no}.pdf?ACIXSTORE=${acix}`);
            } else $('#syllabus').html(syllabus.html());

            for (let i = 0; i < $('#class_accordion > div').length / 2; i++)
              $('.ui.accordion').accordion('close', i);

            $('.course_info.modal').modal('show');
            callback();
          });
        }
      }
    }
  );
}

function getCourseDescription(course_no, callback) {
  if (course_no == undefined) return;
  request(
    {
      url:
        'https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/common/Syllabus/1.php?ACIXSTORE=' +
        acix +
        '&c_key=' +
        course_no,
      encoding: null,
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let str = iconv.decode(new Buffer(body), 'big5');
        let temp = document.createElement('div');
        temp.innerHTML = str;
        // console.log.apply(console, $(temp));

        if (
          $(temp)
            .text()
            .indexOf('session is interrupted!') >= 0
        ) {
          $('#session_alert').modal('show');
        } else {
          let description = $(
            'div > table:nth-child(4) > tbody > tr:nth-child(2) > td',
            temp
          );
          callback(description.html());
        }
      }
    }
  );
}

async function searchByNo_store_getCourseInfo(course_no) {
  let hits = await searchBySingleCourseNo(course_no);
  await storeCourseInfo(hits);
  let id = hits[0]._id;
  getCourseInfo(
    course_no,
    id,
    () => {
      $('.course_action').hide();
      $('#loading').removeClass('active');
    },
    false
  );
}

function getResultCourse(phaseNo, callback) {
  if (callback) $('#loading').addClass('active');
  request.post(
    {
      url:
        'https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.2/7.2.9/JH729002.php',
      form: {
        ACIXSTORE: acix,
        stu_no: stu_no,
        phaseNo: phaseNo,
        year: year,
        term: semester,
      },
      encoding: null,
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let str = iconv.decode(new Buffer(body), 'big5');
        let temp = document.createElement('div');
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf('session is interrupted!') >= 0
        ) {
          miniMessageAlert('系統錯誤', '請登入或重新登入校務資訊系統');
        } else {
          let table = $('form > table:nth-child(3)', temp);
          let parse_table = $.parseHTML(course_table);
          $(parse_table).attr('id', 'course_result_from_nthu');

          let all_time = [];
          $('tbody > tr', table).each(function() {
            if ($(this).index() > 0) {
              let course_no = $('td:nth-child(1)', this).text();
              let course_name = $('td:nth-child(2)', this)
                .text()
                .split(/[A-Za-z]+/)[0];
              course_name = removeLongCourseName(course_name);
              let time = $('td:nth-child(4)', this).text();
              let content = `<a course_no="${course_no}" href="#do_not_jump">${course_name}</a>`;
              if (time.length == 1) {
                $(parse_table)
                  .find('.none')
                  .append(content);
              } else {
                let slice_time = [];
                for (let i = 0, j = 0; i < time.length; i = i + 2, j++) {
                  slice_time[j] = time.slice(i, i + 2);
                  all_time.push(slice_time[j]);
                }
                for (let i = 0; i < slice_time.length; i++) {
                  $(parse_table)
                    .find('.' + slice_time[i])
                    .append(content);
                }
              }
            }
          });
          $('#course_result_from_nthu').replaceWith(parse_table);
          $('#course_result_from_nthu > tr').on('click', 'td', function() {
            if (!$('a', this).attr('course_no')) return;
            $('#multiple_class_list_bySingle').empty();
            if ($(this).children().length > 1) {
              $('a', this).each(function() {
                let course_no = $(this).attr('course_no');
                let text = $(this).text();
                let content = `<div course_no="${course_no}" class="item">
                  <div class="content">
                    <div class="description">${text}</div>
                  </div>
                </div>`;
                $('#multiple_class_list_bySingle').append(content);
              });
              $('#multiple_class_bySingle').modal('show');
            } else {
              let course_no = $('a', this).attr('course_no');
              $('#loading').addClass('active');
              searchByNo_store_getCourseInfo(course_no);
            }
          });

          if (callback) callback();
        }
      }
    }
  );
}

function getGrade(stu_no) {
  request(
    {
      url:
        'https://www.ccxp.nthu.edu.tw/ccxp/INQUIRE/JH/8/R/6.3/JH8R63002.php?ACIXSTORE=' +
        acix,
      encoding: null,
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let str = iconv.decode(new Buffer(body), 'big5');
        let temp = document.createElement('div');
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf('session is interrupted!') >= 0
        ) {
          $('#session_alert').modal('show');
        } else {
          let allGradeOfStudent = $(
            'form > table:nth-child(4) > tbody > tr',
            temp
          );
          let userGrade = Object.create(null);
          $(allGradeOfStudent).each(function(index) {
            if (index > 2 && index < allGradeOfStudent.length - 1) {
              let receive_year = $('td:nth-child(1)', this).text();
              let receive_semester = $('td:nth-child(2)', this).text();
              let getCourseNo = $('td:nth-child(3)', this).text();
              let getCourseGrade = $('td:nth-child(6)', this).text();
              if (
                getCourseGrade.includes('Grade Not Submitted') == false &&
                getCourseGrade.includes('二退') == false &&
                receive_semester == semester
              ) {
                userGrade[
                  receive_year + receive_semester + getCourseNo.trim()
                ] = getCourseGrade.trim();
              }
            }
          });
          console.log({ stu_no });
          console.log(userGrade);
          calculateUserGrade(stu_no, userGrade);
        }
      }
    }
  );
}

export {
  renderUserName,
  getCourseInfo,
  getResultCourse,
  searchByNo_store_getCourseInfo,
  getGrade,
  getCourseDescription,
};
