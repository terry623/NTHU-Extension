import { hello } from "./test";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

var acix = getUrlParameter("ACIXSTORE");
console.log("ACIXSTORE is " + acix);
setInterval(function() {
  change();
}, 1000);

function change() {
  console.log("Change...");
  var target = window.frames[2]["document"]["body"];
  let val = hello();
  console.log("Import Value:" + val);

  $("div > p:first()", target).append(
    `<button type="button" class="btn btn-default">Test</button>`
  );
}
