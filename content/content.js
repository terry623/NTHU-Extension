import { getUrlParameter } from "./help";
import { main } from "./data";

var acix = getUrlParameter("ACIXSTORE");
console.log("ACIXSTORE is " + acix);

// setTimeout(function() {
//   change();
// }, 10000);

// function change() {
//   console.log("Change...");
//   var document = window.frames[2]["document"];
//   $("body", document).append(main);
// }
