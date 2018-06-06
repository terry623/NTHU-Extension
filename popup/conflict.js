import { all_time } from "./helper";

var old_time = [];
function subtractArray(target_time) {
  let slice_time = [];
  for (let each in target_time) {
    let index = old_time.indexOf(target_time[each]);
    if (index == -1) slice_time.push(target_time[each]);
    else old_time.splice(index, 1);
  }
  return slice_time;
}

function storeSliceTime(target_time) {
  let slice_time = subtractArray(target_time);
  old_time = target_time;
  chrome.storage.local.get("time", function(items) {
    let temp = {};
    if (items.time != undefined) {
      Object.assign(temp, items.time);
      for (let each in slice_time) temp[slice_time[each]]++;
      chrome.storage.local.remove("time", function() {
        chrome.storage.local.set({ time: temp }, function() {
          chrome.storage.local.get("time", function(items) {
            // console.log(items);
          });
        });
      });
    } else {
      for (let each in all_time) temp[all_time[each]] = 0;
      for (let each in slice_time) temp[slice_time[each]]++;
      chrome.storage.local.set({ time: temp }, function() {
        chrome.storage.local.get("time", function(items) {
          // console.log(items);
        });
      });
    }
  });
}

function checkConflict(time_array, callback) {
  chrome.storage.local.get("time", function(items) {
    let conflict = false;
    if (items.time != undefined) {
      for (let each in time_array) {
        if (items.time[time_array[each]] != 0 && time_array[each]!="無") conflict = true;
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

function removeTimeOfCourse(time_array, callback) {
  chrome.storage.local.get("time", function(items) {
    let temp = {};
    Object.assign(temp, items.time);
    for (let each in time_array) temp[time_array[each]]--;

    chrome.storage.local.remove("time", function() {
      chrome.storage.local.set({ time: temp }, function() {
        chrome.storage.local.get("time", function(items) {
          // console.log(items);
        });
      });
    });
  });
}

export { storeSliceTime, checkConflict, removeTimeOfCourse };
