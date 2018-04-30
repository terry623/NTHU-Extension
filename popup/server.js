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
  console.log("Collection Of Course...");
  request(
    {
      url: "http://127.0.0.1:5000/api/collectionOfCourse"
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var info = JSON.parse(body);
        var obj = {
          values: []
        };
        for (var v in info.values) {
          obj.values[v] = {
            value: info.values[v].value,
            text: info.values[v].text,
            name: info.values[v].name
          };
        }

        $(".ui.dropdown.search_list_1").dropdown("refresh");
        $(".ui.dropdown.search_list_1").dropdown("setup menu", obj);
      }
    }
  );
}

export { calculateUserGrade, collectionOfCourse };
