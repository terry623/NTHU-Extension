function initDrift() {
  $("#home_loading").addClass("active");
  !(function() {
    var t = (window.driftt = window.drift = window.driftt || []);
    if (!t.init) {
      if (t.invoked)
        return void (
          window.console &&
          console.error &&
          console.error("Drift snippet included twice.")
        );
      (t.invoked = !0),
        (t.methods = [
          "identify",
          "config",
          "track",
          "reset",
          "debug",
          "show",
          "ping",
          "page",
          "hide",
          "off",
          "on"
        ]),
        (t.factory = function(e) {
          return function() {
            var n = Array.prototype.slice.call(arguments);
            return n.unshift(e), t.push(n), t;
          };
        }),
        t.methods.forEach(function(e) {
          t[e] = t.factory(e);
        }),
        (t.load = function(t) {
          var e = 3e5,
            n = Math.ceil(new Date() / e) * e,
            o = document.createElement("script");
          (o.type = "text/javascript"),
            (o.async = !0),
            (o.crossorigin = "anonymous"),
            (o.src = "https://js.driftt.com/include/" + n + "/" + t + ".js");
          var i = document.getElementsByTagName("script")[0];
          i.parentNode.insertBefore(o, i);
        });
    }
  })();
  drift.SNIPPET_VERSION = "0.3.1";
  drift.load("etd922wyz5fx");

  drift.on("ready", function(api, payload) {
    $("#home_loading").removeClass("active");
    api.sidebar.open();
  });

  window.drift.on("startConversation", function(data) {
    // TODO: 要把新創的 conversationId 存在 Server 端
    console.log("User started a new conversation " + data.conversationId);
  });

  window.drift.on("message:sent", function(data) {
    console.log("User replied to conversation " + data.conversationId);
  });

  window.drift.on("message", function(data) {
    console.log(
      "User received a message from " +
        data.teamMember.name +
        " in conversation " +
        data.conversationId
    );
  });
}

export { initDrift };
