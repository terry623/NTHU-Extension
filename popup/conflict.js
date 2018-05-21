function storeSliceTime(slice_time) {
  chrome.storage.local.get("time", function(items) {
    var temp = {};
    var data = {};
    for (var each_time in slice_time) data[slice_time[each_time]] = 1;

    if (items.time != undefined) {
      Object.assign(temp, items.time);
      for (var each_data in data) temp[each_data] = 1;
      chrome.storage.local.remove("time", function() {
        chrome.storage.local.set({ time: temp }, function() {
          chrome.storage.local.get("time", function(items) {
            // console.log(items);
          });
        });
      });
    } else {
      for (var each_data in data) temp[each_data] = data[each_data];
      chrome.storage.local.set({ time: temp }, function() {
        chrome.storage.local.get("time", function(items) {
          // console.log(items);
        });
      });
    }
  });
}

function checkConflict(time, callback) {
  var slice_time = [];
  for (var i = 0, j = 0; i < time.length; i = i + 2, j++)
    slice_time[j] = time.slice(i, i + 2);

  chrome.storage.local.get("time", function(items) {
    var conflict = false;
    if (items.time != undefined) {
      for (var each in slice_time) {
        if (items.time[slice_time[each]] != undefined) conflict = true;
      }
      if (conflict) {
        const negative = `class="error"`;
        callback(negative);
      } else {
        const none = ``;
        callback(none);
      }
    }
  });
}

export { storeSliceTime, checkConflict };
