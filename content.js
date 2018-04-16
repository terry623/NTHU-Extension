// document.body.onload = addElement;

// function addElement() {
//   var newDiv = document.createElement("div");
//   var newContent = document.createTextNode("This is test!This is test!This is test!This is test!");
//   newDiv.appendChild(newContent);
//   document.html.body.div[2].appendChild(newDiv);
// }

// $(
//   "body > table:nth-child(2) > tbody > tr > td:nth-child(1) > table > tbody > tr > td > table:nth-child(2) > tbody > tr:nth-child(5) > td > input:nth-child(1)"
// ).replaceWith(
//   `<input type="submit" name="Submit" value="登入" class="btn btn-primary bottom_class">Primary</button>`
// );

console.log("Append...");

$(document).ready(function() {
  console.log("Please!");
  var t = setTimeout(change, 1000);
});

function change() {
  console.log("Change Color!!");
  $("html > frameset").css("bordercolor", "red");
}
