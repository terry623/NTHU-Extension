import { getUrlParameter } from "./help";
import { test_button } from "./data";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

var acix = getUrlParameter("ACIXSTORE");
console.log("ACIXSTORE is " + acix);
setInterval(function() {
  change();
}, 1000);

function change() {
  console.log("Change Something...");
  var target = window.frames[2]["document"]["body"];
  $("div > p:first()", target).append(test_button);
}
