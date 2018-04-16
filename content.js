document.body.onload = addElement;

function addElement() {
  var newDiv = document.createElement("div");
  var newContent = document.createTextNode("This is test!");
  newDiv.appendChild(newContent);
  document.body.appendChild(newDiv);
}
