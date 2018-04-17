import { getUrlParameter } from "./help";
import { test_button, center } from "./data";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

var acix = getUrlParameter("ACIXSTORE");
console.log("ACIXSTORE is " + acix);
setInterval(function() {
  removeBackground();
  change();
  loadCSS();
}, 5000);

function loadCSS() {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css";
  link.integrity =
    "sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4";
  link.crossOrigin = "anonymous";

  var head = window.frames[2]["document"]["head"];
  $("link", head).replaceWith(link);
}

function removeBackground() {
  var doc = window.frames[2]["document"];
  $("body", doc).removeAttr("background");
}

function change() {
  console.log("Change...");
  var body = window.frames[2]["document"]["body"];

  $("div", body).replaceWith(center);
}
