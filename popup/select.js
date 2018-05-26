var iconv = require("iconv-lite");
var request = require("request");

function planAllCourse(acix) {
  request(
    {
      url:
        "https://www.ccxp.nthu.edu.tw/ccxp/COURSE/JH/7/7.6/7.6.1/JH761004.php?toChk=2&ACIXSTORE=" +
        acix,
      encoding: null
    },

    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        let str = iconv.decode(new Buffer(body), "big5");
        str = str.replace(
          `<img src="templates/pic1.gif" width="351" height="30">`,
          ``
        );
        let temp = document.createElement("div");
        temp.innerHTML = str;

        if (
          $(temp)
            .text()
            .indexOf("session is interrupted!") >= 0
        ) {
          $("#session_alert").modal("show");
        } else {
          let choose_data = {
            toChk: "",
            new_dept: "",
            new_class: "",
            keyword: "",
            chks: "",
            ckey: "",
            chkbtn: ""
          };
          choose_data["toChk"] = $("input[name=toChk]", temp).val();
          choose_data["new_dept"] = $("select[name=new_dept]", temp).val();
          choose_data["new_class"] = $("select[name=new_class]", temp).val();
          choose_data["keyword"] = $("input[name=keyword]", temp).val();
          choose_data["chks"] = $("input[name=chks]", temp).val();
          choose_data["ckey"] = $("input[name=ckey]", temp).val();
          choose_data["chkbtn"] = $("input[name=chkbtn]", temp).val();

          for (var key in choose_data) {
            if (choose_data.hasOwnProperty(key))
              choose_data[key] = choose_data[key].replace(/ /g, "+");
          }

          const test_course_no = "10710CS  460200";
          planEachCourse(acix, test_course_no, choose_data, function() {
            console.log("Finish Choose One Course");
          });
        }
      }
    }
  );
}

function serialize(obj) {
  let str = [];
  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(p + "=" + obj[p]);
    }
  return str.join("&");
}

function planEachCourse(acix, course_no, choose_data, callback) {
  course_no = course_no.replace(/ /g, "+");

  // FIXME: 有些值要寫死，不然會變成 null
  console.log(choose_data.toChk);
  console.log(choose_data.new_dept); //
  console.log(choose_data.new_class); //
  console.log(choose_data.keyword);
  console.log(choose_data.chks); //
  console.log(choose_data.ckey);
  console.log(choose_data.chkbtn);
  console.log(course_no); //

  let form = {
    ACIXSTORE: acix,
    toChk: choose_data.toChk,
    new_dept: choose_data.new_dept,
    new_class: choose_data.new_class,
    keyword: choose_data.keyword,
    chks: choose_data.chks,
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
      console.log.apply(console, $(temp));
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
        $("#choose_course_alert_text").text(res[1]);
        $("#choose_course_alert").modal("show");
      } else {
        console.log("Correct!");
        callback();
      }
    });
}

export { planAllCourse };
