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
        console.log(body);
      }
    }
  );
}

function collectionOfCourse() {
  var return_val;
  request(
    {
      url: "http://127.0.0.1:5000/api/collectionOfCourse"
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log("Message: " + info.message);
        return_val = info.message;
      }
    }
  );

  // FIXME: 要改成等 request 做完才 return 值
  return {
    values: [{ value: return_val, text: return_val, name: return_val }]
  };
}

export { calculateUserGrade, collectionOfCourse };
