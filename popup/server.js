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
  request(
    {
      url: "http://127.0.0.1:5000/api/getSimilarities?course_id=" + course_id
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var info = JSON.parse(body);
        callback(info);
      }
    }
  );
}

export { calculateUserGrade, collectionOfCourse, getSimilarities };
