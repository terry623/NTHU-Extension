import { getUrlParameter } from "./help";
import { center } from "./data";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

var acix = getUrlParameter("ACIXSTORE");
console.log("ACIXSTORE is " + acix);
setInterval(function() {
  removeOriginCss();
  removeBackground();
  change();
}, 5000);

function removeOriginCss() {
  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.extension.getURL("semantic/dist/semantic.min.css");
  var head = window.frames[2]["document"]["head"];
  $("link", head).replaceWith(link);

  var script = document.createElement("script");
  script.src = chrome.extension.getURL("semantic/dist/semantic.min.js");
  $("link", head).after(script);

  // var origin_css = window.frames[2]["document"]["head"];
  // $("link", origin_css).remove();
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
