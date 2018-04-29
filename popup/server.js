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

export { calculateUserGrade };
