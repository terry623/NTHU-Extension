import { getCart } from "./cart";
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

// TODO: 必須進入選課系統，且格式都需相符(改成像人數一樣，去搜尋把資料抓回來)
function selectTestCourse(acix) {
  let url = `https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH7130041.php`;
  let form = {
    ACIXSTORE: acix,
    toChk: "",
    new_dept: "",
    new_class: "",
    chks: "",
    // 通識要的志願序
    aspr: "",
    // 後面的值都為必須
    ckey: "10710CS  337100",
    code: "CS  ",
    div: "EECS",
    real: "WW0014",
    cred: "3",
    ctime: "T7T8R7<br>",
    num: "80",
    glimit: " ",
    type: "",
    pre: "",
    range: " ",
    chkbtn: "add"
  };

  fetch(url, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
    }),
    credentials: "include",
    redirect: "follow",
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
  // 預排選課
  let url = `https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.6/7.6.1/JH761005.php`;
  let form = {
    ACIXSTORE: acix,
    toChk: "",
    new_dept: "",
    new_class: "",
    keyword: "",
    chks: "",
    ckey: course_no,
    chkbtn: "add"
  };

  // 正式選課
  // let url = `https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.1/7.1.3/JH7130041.php`;
  // let form = {
  //   ACIXSTORE: acix,
  //   toChk: "",
  //   new_dept: "++",
  //   new_class: "++++++++++",
  //   chks: "++++++++++++++++++",
  //   aspr: "",
  //   ckey: "10710CS  337100",
  //   code: "CS  ",
  //   div: "EECS",
  //   real: "WW0014",
  //   cred: "3",
  //   ctime: "T7T8R7<br>",
  //   num: "80",
  //   glimit: " ",
  //   type: "",
  //   pre: "",
  //   range: " ",
  //   chkbtn: "add"
  // };

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
