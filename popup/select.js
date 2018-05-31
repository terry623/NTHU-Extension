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

// TODO: 正式選課時要處理志願序問題
function planEachCourse(acix, course_no, callback) {
  course_no = course_no.replace(/ /g, "+");
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

  fetch(
    "https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.6/7.6.1/JH761005.php",
    {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
      }),
      credentials: "include",
      body: serialize(form)
    }
  )
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
        let res = origin.split("'");

        // TODO: 將錯誤訊息記錄起來
        // $("#choose_course_alert_text").text(res[1]);

        let isSuccess = false;
        callback(isSuccess);
      } else {
        let isSuccess = true;
        callback(isSuccess);
      }
    });
}

function planAllCourse(acix, cart, callback) {
  let count = 1;
  correct_list = [];
  wrong_list = [];
  for (let key in cart) {
    let course_no = cart[key].course_no;
    planEachCourse(acix, course_no, function(isSuccess) {
      if (isSuccess == true) correct_list.push(course_no);
      else wrong_list.push(course_no);

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
          $("#select_state").modal("show");
        });
      });
    });
  });
}

export { planAllCourse, removeSuccessSelectCourse };
