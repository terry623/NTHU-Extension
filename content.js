console.log("Append...");
setInterval(function() {
  change_txt();
}, 1000);
// function make_side_red() {
//   var target = window.frames[1]["document"]["body"];
//   $(target)
//     .find()
//     .after();
// }

function change_txt() {
  console.log("Change Text...");
  var target = window.frames[2]["document"]["body"];
  $("div > p:first()", target).text("拜託嗚嗚嗚!!");
}
