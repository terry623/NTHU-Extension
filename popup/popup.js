window._crypto = null;
import { initDrift } from './drift';
initDrift();
import { getUrlVars, miniMessageAlert } from './helper';
import { renderUserName, getResultCourse, getGrade } from './api';
import { getCart } from './cart';
import { getCurrentStateOfNTHU } from './server';
import { clearAllTime } from './conflict';
import {
  getRecommendPage,
  toStorage,
  before_hits_group,
  compare_group,
  num_of_old_course,
  num_of_each_similar,
} from './recommend';

const year = '107';
const semester = '10';
const search_result_num = 10;
let acix, stu_no, current_phase;

function addListener() {
  chrome.webRequest.onBeforeSendHeaders.addListener(
    details => {
      let headers = details.requestHeaders;
      let blockingResponse = {};
      headers.push({
        name: 'Referer',
        value: `https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH713004.php?ACIXSTORE=${acix}`,
      });
      blockingResponse.requestHeaders = headers;
      return blockingResponse;
    },
    {
      urls: [
        `https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH7130041.php`,
      ],
    },
    ['requestHeaders', 'blocking']
  );
}

async function initial_everything() {
  $('#home_loading').addClass('active');
  clearAllTime();
  addListener();
  renderUserName();
  let phase = await getCurrentStateOfNTHU();
  $('.content_item.homePage').show();
  $('#home_loading').removeClass('active');
  if (phase != undefined) {
    current_phase = phase;
    getResultCourse(phase);
  } else $('#change_phase').addClass('disabled');
  getCart();
  getGrade(stu_no);
}

$(document).ready(() => {
  $('.content_item').hide();
  chrome.tabs.query(
    { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
    tabs => {
      let url = tabs[0].url;
      acix = getUrlVars(url)['ACIXSTORE'];
      stu_no = getUrlVars(url)['hint'];
      initial_everything();
    }
  );
});

// chrome.storage.local.clear(() => {
//   console.log('Clear Local Data');
//   let error = chrome.runtime.lastError;
//   if (error) {
//     console.error(error);
//   }
// });

$('.ui.accordion').accordion();
$('.ui.dropdown').dropdown();
$('#change_phase').dropdown({
  on: 'click',
  action: function(text, value) {
    current_phase = value;
    getResultCourse(value, () => {
      $('#loading').removeClass('active');
    });
    $('#change_phase').dropdown('set text', text);
    $('#change_phase').dropdown('hide');
  },
});
$('.ui.modal').modal({
  inverted: true,
});
// $('#introduce').on('hover', '.actionLink', function() {
//   $(this).css('cursor', 'pointer');
// });
$('.ui.secondary.menu').on('click', '.item', function() {
  if (!$(this).hasClass('dropdown') && !$(this).is('.notActive')) {
    if ($(this).hasClass('recommendPage')) {
      miniMessageAlert('推薦課程','開發階段，敬請期待 !');
      return;
    }
    $(this)
      .addClass('active')
      .siblings('.item')
      .removeClass('active');

    let t = $('.content_item');
    t.show();
    $('#change_school_table').hide();

    drift.on('ready', function(api, payload) {
      api.sidebar.close();
      api.widget.hide();
    });

    if ($(this).hasClass('homePage')) {
      t.not('.homePage').hide();
      drift.on('ready', function(api, payload) {
        api.widget.show();
      });
    } else if ($(this).hasClass('searchPage')) t.not('.searchPage').hide();
    else if ($(this).hasClass('choosePage')) {
      t.not('.choosePage').hide();
      $('#change_school_table').show();
    } else if ($(this).hasClass('recommendPage')) {
      // t.not('.recommendPage').hide();
      // before_hits_group.length = 0;
      // compare_group.length = 0;
      // let content_group = [];
      // getRecommendPage(() => {
      //   // FIXME: 這裡的限制條件有改過
      //   // if (
      //   //   before_hits_group.length <=
      //   //   num_of_old_course * num_of_each_similar
      //   // ) {
      //   toStorage((content, count, compare_value) => {
      //     content_group.push({ content, compare_value });
      //     // FIXME: 這裡的限制條件有改過
      //     if (count == before_hits_group.length - 1) {
      //       content_group.sort((a, b) => b.compare_value - a.compare_value);
      //       for (let data of content_group)
      //         $('#recommend_list').append(data.content);
      //       $('#recommend_loading').removeClass('active');
      //     }
      //   });
      //   // }
      // });
    }
  }
});

export { acix, stu_no, year, semester, current_phase, search_result_num };
