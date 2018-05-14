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

function translateTopic(topic) {
  var result;
  switch (topic) {
    case "課名":
      result = "課程中文名稱";
      break;
    case "科號":
      result = "科號";
      break;
    case "教師":
      result = "教師";
      break;
    case "時間":
      result = "時間";
      break;
    case "地點":
      result = "教室";
      break;
    case "對象":
      result = "通識對象";
      break;
    case "類別":
      result = "通識類別";
      break;
    case "科系":
      result = "必選修";
      break;
    case "學程":
      result = "學程";
      break;
    case "專長":
      result = "第一二專長";
      break;
    default:
      alert("Translate Topic Wrong !");
      break;
  }
  return result;
}

export { getUrlVars, courseAddSpace, translateTopic };
