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

function getCurrentPhase() {
  //  選課紀錄
  //  100  第 1 次選課 log 記錄
  //  100P 第 1 次選課亂數結果
  //  101  第 2 次選課 log 記錄
  //  101P 第 2 次選課結束(已亂數處理)
  //  200  第 3 次選課 log 記錄
  //  200P 第 3 次選課結束(已亂數處理)
  //  200S 加退選開始前(含擋修、衝堂)
  //  300  加退選 log 記錄
  //  300P 加退選結束(已處理)
  //  400  停修 log 記錄
  var currentPhase = 100;
  return currentPhase;
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

export { getUrlVars, courseAddSpace, getCurrentPhase, translateTopic };
