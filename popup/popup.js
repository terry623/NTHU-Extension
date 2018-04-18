//   chrome.tabs.executeScript({
//     file: "alert.js"
//   });

$("#clickme").click(function() {
  console.log("Click Button");
  $("#testModal").modal("show");
});