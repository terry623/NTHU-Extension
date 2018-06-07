import { getCart } from "./cart";
var iconv = require("iconv-lite");
var request = require("request");
var correct_list = [];
var wrong_list = [];

function serialize(obj) {
  let str = [];
  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(p + "=" + obj[p]);
    }
  return str.join("&");
}

// // Correct
// ACIXSTORE=ms2ni64uj4fce4q254p8e9etk3&toChk=&new_dept=CS&new_class=CS++104BA+&chks=%A5%B2%BF%EF%AD%D7&aspr=&ckey=10710CS++390200&code=CS++&div=EECS&real=CD0158&cred=1&ctime=+&num=+&glimit=+&type=&pre=Y&range=+&chkbtn=add
// // Wrong
// ACIXSTORE=ms2ni64uj4fce4q254p8e9etk3&toChk=&new_dept=  &new_class=          &chks=                  &aspr=&ckey=10710CS++330500&code=    &div=    &real=      &cred= &ctime= &num= &glimit= &type=&pre= &range= &chkbtn=add

function selectTestCourse(acix, course_no) {
  course_no = course_no.replace(/ /g, "+");
  let url =
    `https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH713005.php?ACIXSTORE=` +
    acix;
  let form = {
    ACIXSTORE: acix,
    toChk: "",
    new_dept: "",
    new_class: "",
    chks: "",
    aspr: "",
    ckey: course_no,
    code: "",
    div: "",
    real: "CD0158",
    cred: "0",
    ctime: "",
    num: "",
    glimit: "",
    type: "",
    pre: "",
    range: "",
    chkbtn: "add"
  };

  fetch(url, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }),
    credentials: "include",
    body: serialize(form)
  })
    .then(res => res.arrayBuffer())
    .then(data => {
      let temp = document.createElement("div");
      let decode_data = new TextDecoder("big5").decode(data);
      decode_data = decode_data.replace(
        `<img src="templates/pic1.gif" width="351" height="30">`,
        ``
      );
      temp.innerHTML = decode_data;
      console.log.apply(console, $(temp));
    });
}

function selectEachCourse(acix, course_no, callback) {
  course_no = course_no.replace(/ /g, "+");

  // 預排選課
  // let url = `https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.6/7.6.1/JH761005.php`;
  // let form = {
  //   ACIXSTORE: acix,
  //   toChk: "",
  //   new_dept: "",
  //   new_class: "",
  //   keyword: "",
  //   chks: "",
  //   ckey: course_no,
  //   chkbtn: "add"
  // };

  // 正式選課
  let url =
    `https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH713005.php?ACIXSTORE=` +
    acix;
  let form = {
    ACIXSTORE: acix,
    toChk: "",
    new_dept: "",
    new_class: "",
    chks: "",
    aspr: "",
    ckey: course_no,
    code: "",
    div: "",
    real: "xxx",
    cred: "0",
    ctime: "",
    num: "",
    glimit: "",
    type: "",
    pre: "",
    range: "",
    chkbtn: "add"
  };

  fetch(url, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }),
    credentials: "include",
    body: serialize(form)
  })
    .then(res => res.arrayBuffer())
    .then(data => {
      let temp = document.createElement("div");
      let decode_data = new TextDecoder("big5").decode(data);
      decode_data = decode_data.replace(
        `<img src="templates/pic1.gif" width="351" height="30">`,
        ``
      );
      temp.innerHTML = decode_data;
      // console.log.apply(console, $(temp));
      if (
        $(temp)
          .text()
          .indexOf("session is interrupted!") >= 0
      ) {
        $("#session_alert").modal("show");
      } else if (
        $(temp)
          .text()
          .indexOf("alert") >= 0
      ) {
        let origin = $("script", temp)
          .first()
          .text();
        let message = origin.split("'")[1];
        let isSuccess = false;
        callback(isSuccess, message);
      } else {
        let isSuccess = true;
        callback(isSuccess);
      }
    });
}

function selectAllCourse(acix, cart, callback) {
  let count = 1;
  correct_list = [];
  wrong_list = [];
  for (let key in cart) {
    let course_no = cart[key].course_no;
    selectEachCourse(acix, course_no, function(isSuccess, message) {
      if (isSuccess == true) correct_list.push(course_no);
      else {
        wrong_list.push({ course_no, message });
      }
      callback(count);
      count++;
    });
  }
}

function findIdFromObject(obj, course_no) {
  let id = null;
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      if (obj[prop].course_no == course_no) {
        id = prop;
        break;
      }
    }
  }
  return id;
}

function removeSuccessSelectCourse(acix, callback) {
  chrome.storage.local.get("cart", function(items) {
    let temp = {};
    Object.assign(temp, items.cart);
    for (let no in correct_list) {
      let course_id = findIdFromObject(temp, correct_list[no]);
      delete temp[course_id];
    }
    chrome.storage.local.remove("cart", function() {
      chrome.storage.local.set({ cart: temp }, function() {
        chrome.storage.local.get("cart", function(items) {
          // console.log(items);
          getCart(acix);
          callback();
        });
      });
    });
  });
}

function showCourseModal(callback) {
  $("#select_course_status").empty();
  if (wrong_list.length != 0) {
    $("#select_course_status").append(`<div class="item">失敗：</div>`);
    for (let each in wrong_list) {
      let content =
        `<div class="item">` +
        wrong_list[each].course_no +
        ` ( ` +
        wrong_list[each].message +
        ` )` +
        `</div>`;
      $("#select_course_status").append(content);
    }
  } else {
    $("#select_course_status").append(
      `<div class="item">全數選課成功&nbsp;&nbsp;!&nbsp;&nbsp;請至校務資訊系統再次確認</div>`
    );
  }
  $("#select_state").modal("show");
  callback();
}

function submitToNTHU(acix) {
  chrome.storage.local.get("cart", function(items) {
    if (items.cart != undefined) {
      let course_num = Object.keys(items.cart).length;
      selectAllCourse(acix, items.cart, function(count) {
        if (count == course_num) {
          console.log("Finish Select All Course !");
          removeSuccessSelectCourse(acix, function() {
            showCourseModal(function() {
              $("#send_to_nthu_loading").removeClass("active");
            });
          });
        }
      });
    } else {
      $("#send_to_nthu_loading").removeClass("active");
    }
  });
}

function storeOrderToStorage(course_id_group, callback) {
  chrome.storage.local.get("cart", function(items) {
    let temp = {};
    Object.assign(temp, items.cart);
    for (let each in course_id_group) {
      let id = course_id_group[each].course_id;
      let order = course_id_group[each].order;
      temp[id].order = order;
    }

    chrome.storage.local.remove("cart", function() {
      chrome.storage.local.set({ cart: temp }, function() {
        chrome.storage.local.get("cart", function(items) {
          // console.log(items);
          callback();
        });
      });
    });
  });
}

export { submitToNTHU, storeOrderToStorage, selectTestCourse };

// // chrome extension
// POST /ccxp/COURSE/JH/7/7.1/7.1.3/JH713005.php?ACIXSTORE=b4fn20hilh1pk9qlesdpj4ufi7 HTTP/1.1
// Host: www.ccxp.nthu.edu.tw
// Connection: keep-alive
// Content-Length: 219
// Origin: null
// User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36
// content-type: application/x-www-form-urlencoded; charset=utf-8
// Accept:

// // NTHU
// POST /ccxp/COURSE/JH/7/7.1/7.1.3/JH713005.php?ACIXSTORE=b4fn20hilh1pk9qlesdpj4ufi7 HTTP/1.1
// Host: www.ccxp.nthu.edu.tw
// Connection: keep-alive
// Content-Length: 219
// Cache-Control: max-age=0
// Origin: https://www.ccxp.nthu.edu.tw
// Upgrade-Insecure-Requests: 1
// Content-Type: application/x-www-form-urlencoded
// User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36
// Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
// Referer: https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH713004.php?ACIXSTORE=b4fn20hilh1pk9qlesdpj4ufi7

