var request = require("request");

function calculateUserGrade(stu_no, userGrade) {
  request.post(
    {
      url: "http://127.0.0.1:5000/api/calculateUserGrade",
      form: {
        stu_no: stu_no,
        userGrade: userGrade
      }
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        console.log("Calculate User Grade...");
        console.log(body);
      }
    }
  );
}

function collectGradeDistribution(course_no, distribution) {
  request.post(
    {
      url: "http://127.0.0.1:5000/api/collectGradeDistribution",
      form: {
        course_no: course_no,
        distribution: distribution
      }
    },
    function(err, response, body) {
      if (!err && response.statusCode == 200) {
        console.log("Collect Grade Distribution...");
        console.log(body);
      }
    }
  );
}

export { calculateUserGrade, collectGradeDistribution };
