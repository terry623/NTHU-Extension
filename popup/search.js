import {
  translateTopic,
  sort_weekday,
  addSpace_course_no,
  miniMessageAlert,
} from './helper';
import { checkConflict } from './conflict';
import { search_result_num } from './popup';
import { getCart } from './cart';
import { removeTimeOfCourse } from './conflict';
import { getCourseInfo } from './api';

var request = require('request');
const baseURL = `http://nthucourse-env.vvj7ipe3ws.us-east-1.elasticbeanstalk.com/api/`;
// const baseURL = `http://192.168.99.100/api/`;
// const baseURL = `localhost:80/api/`;

function renderSearchResult(hits, callback) {
  let page_num_content = ``;
  let all_page = Math.ceil(hits.length / 10.0);
  for (let i = 1; i < all_page; i++) {
    let page_num = i + 1;
    page_num_content = page_num_content.concat(
      `<a class="page item">${page_num}</a>`
    );
  }
  let change_page = `<a class="icon item"><i class="left chevron icon"></i></a>
  <a class="page active item">1</a>${page_num_content}
  <a class="icon item"><i class="right chevron icon"></i></a>`;

  $('#search_page_change').empty();
  $('#search_page_change').append(change_page);
  storeCourseInfo(hits);

  if (hits.length == 0) miniMessageAlert('查無資料', '試試看別的關鍵字吧!');
  else {
    let copy_hits = [];
    Object.assign(copy_hits, hits);
    let all_should_row = Math.ceil(copy_hits.length / 10.0) * 10;
    let fill_empty_num = all_should_row - copy_hits.length;
    for (let i = fill_empty_num; i > 0; i--) copy_hits.push('empty');

    for (let each of copy_hits) {
      let row;
      let id, source, time, classroom;
      let teacher = [];
      let isEmpty = false;
      if (each == 'empty') {
        row = `<tr class="empty_row">
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td></tr>`;
        time = 'empty';
        isEmpty = true;
      } else {
        id = each._id;
        source = each._source;

        time = source.時間;
        if (time.length == 0) time.push('無');
        sort_weekday(time);

        classroom = source.教室;
        if (classroom.length == 0) classroom.push('無');

        for (let each_teacher of source.教師)
          teacher.push(each_teacher.split('\t')[0]);
        teacher.splice(-1, 1);
      }
      checkConflict(time, negative => {
        if (isEmpty == false) {
          row = `<tr ${negative} id="${id}">
          <td>${source.科號}</td>
          <td>${source.課程中文名稱}</td>
          <td>${time}</td>
          <td>${classroom.join('<br/>')}</td>
          <td>`;
          row += teacher.join('<br>') + `</td></tr>`;
        }

        $('#search_result_body').append(row);
        $('#search_result_body > tr')
          .filter(function(index) {
            return index >= 10;
          })
          .hide();
        $('#search_result_body > tr').hover(function() {
          if (!$(this).hasClass('empty_row')) $(this).css('cursor', 'pointer');
        });
      });
    }
  }
  callback();
}

function searchOnlyKeyword(search_topic, keyword, callback) {
  request.post(
    {
      url: `${baseURL}searchOnlyKeyword`,
      form: {
        search_topic: search_topic,
        keyword: keyword,
      },
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let resp = JSON.parse(body);
        let hits = resp.hits.hits;
        renderSearchResult(hits, callback);
      }
    }
  );
}

function searchDoubleKeyword(search_topic, keyword, other_keyword, callback) {
  request.post(
    {
      url: `${baseURL}searchDoubleKeyword`,
      form: {
        search_topic,
        keyword,
        other_keyword,
      },
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let resp = JSON.parse(body);
        let hits = resp.hits.hits;
        renderSearchResult(hits, callback);
      }
    }
  );
}

function searchTime(search_topic, keyword, time_group, callback) {
  console.log(time_group);
  request.post(
    {
      url: `${baseURL}searchTime`,
      form: {
        search_topic: search_topic,
        keyword: keyword,
        time_group: JSON.stringify(time_group),
      },
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let resp = JSON.parse(body);
        let hits = resp.hits.hits;
        renderSearchResult(hits, callback);
      }
    }
  );
}

function searchByKeyword(keyword, other_keyword, topic, callback) {
  $('#search_result_body').empty();
  $('#loading').addClass('active');
  let search_topic = translateTopic(topic);
  if (search_topic == '科號') keyword = addSpace_course_no(keyword);

  if (other_keyword == 'NoNeedToChoose') {
    console.log(`search_topic:${search_topic},keyword:${keyword}`);
    searchOnlyKeyword(search_topic, keyword, callback);
  } else {
    console.log(
      `search_topic:${search_topic},keyword:${keyword},other_keyword:${other_keyword}`
    );
    if (search_topic == '時間')
      searchTime(search_topic, keyword, other_keyword, callback);
    else searchDoubleKeyword(search_topic, keyword, other_keyword, callback);
  }
}

const storeCourseInfo = hits => {
  return new Promise(resolve => {
    chrome.storage.local.get('course', items => {
      let temp = {};
      let data = {};
      for (let each of hits) {
        let source = each._source;
        data[each._id] = {
          不可加簽說明: source.不可加簽說明,
          人限: source.人限,
          備註: source.備註,
          學分數: source.學分數,
          授課語言: source.授課語言,
          擋修說明: source.擋修說明,
          新生保留人數: source.新生保留人數,
          科號: source.科號,
          課程中文名稱: source.課程中文名稱,
          課程英文名稱: source.課程英文名稱,
          課程限制說明: source.課程限制說明,
          通識對象: source.通識對象,
          通識類別: source.通識類別,
          開課代碼: source.開課代碼,
          教師: source.教師,
          教室: source.教室,
          時間: source.時間,
          學程: source.學程,
          必選修: source.必選修,
          第一二專長: source.第一二專長,
          相似課程: [],
        };
      }

      if (items.course != undefined) {
        Object.assign(temp, items.course);
        for (let each_data in data) {
          if (!temp.hasOwnProperty(each_data)) {
            temp[each_data] = data[each_data];
          }
        }
        chrome.storage.local.remove('course', () => {
          chrome.storage.local.set({ course: temp }, () => {
            chrome.storage.local.get('course', items => {
              // console.log(items);
              if (resolve) resolve();
            });
          });
        });
      } else {
        for (let each_data in data) temp[each_data] = data[each_data];
        chrome.storage.local.set({ course: temp }, () => {
          chrome.storage.local.get('course', items => {
            // console.log(items);
            if (resolve) resolve();
          });
        });
      }
    });
  });
};

const searchBySingleCourseNo = course_no =>
  new Promise(resolve => {
    let new_course_no = addSpace_course_no(course_no);
    request.post(
      {
        url: `${baseURL}searchBySingleCourseNo`,
        form: {
          course_no: new_course_no,
        },
      },
      (err, response, body) => {
        if (!err && response.statusCode == 200) {
          let resp = JSON.parse(body);
          let hits = resp.hits.hits;
          resolve(hits);
        }
      }
    );
  });

function searchByID_Group(id_group, callback) {
  request.post(
    {
      url: `${baseURL}searchByID_Group`,
      form: {
        id_0: id_group[0].other_id,
        id_1: id_group[1].other_id,
        id_2: id_group[2].other_id,
      },
    },
    (err, response, body) => {
      if (!err && response.statusCode == 200) {
        let resp = JSON.parse(body);
        let hits = resp.hits.hits;
        callback(hits);
      }
    }
  );
}

function dependOnType(topic) {
  $('.other_entry').hide();
  $('.ui.dropdown.search_entry_item')
    .dropdown('clear')
    .dropdown({
      fullTextSearch: 'exact',
    });
  $('.ui.dropdown.search_entry_item');
  if (topic == '上課時間') $('#time_select_entry').show();
  else if (topic == '通識對象') $('#ge_people_entry').show();
  else if (topic == '通識類別') $('#ge_type_select_entry').show();
  else if (topic == '系必選修') $('#dept_entry').show();
  else if (topic == '學分學程') $('#program_entry').show();
  else if (topic == '第一二專長') $('#skill_entry').show();
  else $('#main_other_entry').show();
}

function clickToSearch() {
  let topic = $('#topic_name').text();
  let keyword = $('#keyword').val();
  let other_keyword = 'NoNeedToChoose';
  if (topic == '上課時間') {
    other_keyword = $('#time_select_text').val();
  } else if (topic == '通識對象') {
    other_keyword = $('#ge_people_text').val();
  } else if (topic == '通識類別') {
    other_keyword = $('#ge_type_select_text').val();
  } else if (topic == '系必選修') {
    other_keyword = $('#dept_entry_text').val();
  } else if (topic == '學分學程') {
    other_keyword = $('#program_entry_text').val();
  } else if (topic == '第一二專長') {
    other_keyword = $('#skill_entry_text').val();
  }

  if (other_keyword == '') {
    miniMessageAlert('搜尋錯誤', '你沒有選擇進階輸入!');
    return;
  } else if (other_keyword == 'NoNeedToChoose') {
    if ($('#keyword').val() == '') {
      miniMessageAlert('搜尋錯誤', '你的關鍵字沒輸入!');
      return;
    }
  }
  searchByKeyword(keyword, other_keyword, topic, () => {
    $('#loading').removeClass('active');
    $('#search_result_page').show();
  });
  $('#search_page_change > a').removeClass('active');
  $('#search_page_change > a:nth-child(2)').addClass('active');
}

$('.course_type.browse').popup({
  popup: $('.ui.course_type.popup'),
  position: 'bottom left',
  on: 'click',
});
$('.ui.course_type.popup').on('click', '.item', function() {
  dependOnType($(this).text());
  $('#keyword').val('');
  $('#topic_name').text($(this).text());
  $('.ui.course_type.popup').popup('hide all');
  $('.other_entry_dropdown').dropdown('show');
});
$('#submit').on('click', function() {
  chrome.storage.local.get('cart', items => {
    let get_course_id = $('.course_info.scrolling.content').attr('id');
    let temp = {};
    let time_array = $('#time')
      .text()
      .split(',');
    let order = '-1';

    if (
      $('#GE_type').text() != '' ||
      $('#no')
        .text()
        .includes('PE')
    ) {
      order = 0;
    }

    let data = {
      course_no: $('#no').text(),
      course_name: $('#course_name').text(),
      time: time_array,
      order: order,
    };

    if (items.cart != undefined) {
      if (items.cart.hasOwnProperty(get_course_id)) {
        miniMessageAlert('無法加入', '清單中已經有此課程!');
        return;
      }

      Object.assign(temp, items.cart);
      temp[get_course_id] = data;

      chrome.storage.local.remove('cart', () => {
        chrome.storage.local.set({ cart: temp }, () => {
          chrome.storage.local.get('cart', items => {
            // console.log(items);
            getCart();
          });
        });
      });
    } else {
      temp[get_course_id] = data;
      chrome.storage.local.set({ cart: temp }, () => {
        chrome.storage.local.get('cart', items => {
          // console.log(items);
          getCart();
        });
      });
    }
    miniMessageAlert(
      '成功送出至清單',
      '注意，要到課表頁面按送出',
      '校務資訊系統才會真正選到課'
    );
  });
});
$('#delete').on('click', function() {
  chrome.storage.local.get('cart', items => {
    let get_course_id = $('.course_info.scrolling.content').attr('id');
    let temp = {};
    Object.assign(temp, items.cart);
    removeTimeOfCourse(temp[get_course_id].time);
    delete temp[get_course_id];

    chrome.storage.local.remove('cart', () => {
      chrome.storage.local.set({ cart: temp }, () => {
        chrome.storage.local.get('cart', items => {
          // console.log(items);
          getCart();
        });
      });
    });
    miniMessageAlert('成功刪除此課程', '已將這門課從清單中移除');
  });
});
$('#search_result_body').on('click', 'tr', function() {
  if (!$(this).hasClass('empty_row')) {
    let course_from_click = $('td:nth-child(1)', this).text();
    let course_id = $(this).attr('id');
    getCourseInfo(
      course_from_click,
      course_id,
      () => {
        $('.course_action').hide();
        $('#submit').show();
        $('#back').show();
        $('#loading').removeClass('active');
      },
      false
    );
  }
});
$('#keyword').keypress(function(e) {
  if (e.which == 13) {
    clickToSearch();
  }
});
$('#clicktosearch').on('click', function() {
  clickToSearch();
});
$('#search_page_change').on('click', '.page.item', function() {
  $(this)
    .addClass('active')
    .siblings('.item')
    .removeClass('active');
  let start = (parseInt($(this).text()) - 1) * search_result_num;
  $('#search_result_body  > tr')
    .show()
    .filter(function(index) {
      return index < start || index >= start + search_result_num;
    })
    .hide();
});

export { searchBySingleCourseNo, storeCourseInfo, searchByID_Group, baseURL };
