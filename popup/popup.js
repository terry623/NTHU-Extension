$(".ui.dropdown").dropdown();

$("#clickme").click(function() {
  console.log("Click Button");
  $("#testModal").modal("show");
});

$(".ui.menu").on("click", ".item", function() {
  if (!$(this).hasClass("dropdown")) {
    $(this)
      .addClass("active")
      .siblings(".item")
      .removeClass("active");
  }
});
