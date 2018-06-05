function storeSliceTime(slice_time, source) {
  chrome.storage.local.get("time", function(items) {
    var temp = {};
    var data = {};
    var text;
    if (source == "from_school") text = "校務資訊系統";
    else text = "等待送出清單";
    for (var each_time in slice_time) data[slice_time[each_time]] = text;

    if (items.time != undefined) {
      Object.assign(temp, items.time);
      for (var each_data in data) temp[each_data] = text;
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

// FIXME: 移除課程，沒有把對應的時間拿掉
function checkConflict(time_array, callback) {
  chrome.storage.local.get("time", function(items) {
    let conflict = false;
    if (items.time != undefined) {
      for (let each in time_array) {
        if (items.time[time_array[each]] != undefined) conflict = true;
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
