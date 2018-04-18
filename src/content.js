import { getUrlParameter } from "./help";
import { main } from "./data";
import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

var acix = getUrlParameter("ACIXSTORE");
console.log("ACIXSTORE is " + acix);

setTimeout(function() {
  addCss();
  change();
}, 15000);

setTimeout(function() {
  console.log("Show Modal...");
  var body = window.frames[2]["document"]["body"];
  $(".ui.modal", body).modal("show");
}, 20000);

function addCss() {
  console.log("Add Css...");
  var head = window.frames[2]["document"]["head"];

  var script = document.createElement("script");
  script.src = chrome.extension.getURL("semantic/dist/semantic.min.js");
  $("link:first", head).before(script);

  // var jq = document.createElement("script");
  // jq.src = "https://code.jquery.com/jquery-3.1.1.min.js";
  // jq.integrity = "sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8=";
  // jq.crossorigin = "anonymous";
  // $("link:first", head).before(jq);

  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = chrome.extension.getURL("semantic/dist/semantic.min.css");
  $("script:first", head).before(link);
}

// function removeBackground() {
//   var doc = window.frames[2]["document"];
//   $("body", doc).removeAttr("background");
// }

function change() {
  console.log("Change...");
  var document = window.frames[2]["document"];
  $("body", document).append(main);
}
