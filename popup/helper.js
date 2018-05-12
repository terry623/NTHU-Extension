function getUrlVars(url) {
  var vars = [];
  var hash;
  var hashes = url.slice(url.indexOf("?") + 1).split("&");
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split("=");
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

function courseAddSpace(course_no) {
  var myRe = /[0-9]+[A-Za-z]+/g;
  var myArray = myRe.exec(course_no);
  var output = [
    course_no.slice(0, myRe.lastIndex),
    course_no.slice(myRe.lastIndex)
  ].join(" ");
  return output;
}

export { getUrlVars, courseAddSpace };
