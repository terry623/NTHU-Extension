import { all_time } from './helper';

var old_time = [];
function subtractArray(target_time) {
  let slice_time = [];
  for (let each of target_time) {
    let index = old_time.indexOf(each);
    if (index == -1) slice_time.push(each);
    else old_time.splice(index, 1);
  }
  return slice_time;
}

function storeSliceTime(target_time) {
  let slice_time = subtractArray(target_time);
  old_time = target_time;
  chrome.storage.local.get('time', items => {
    let temp = {};
    if (items.time != undefined) {
      Object.assign(temp, items.time);
      for (let each of slice_time) temp[each]++;
      chrome.storage.local.remove('time', () => {
        chrome.storage.local.set({ time: temp }, () => {
          chrome.storage.local.get('time', items => {
            console.log(items);
          });
        });
      });
    } else {
      for (let each of all_time) temp[each] = 0;
      for (let each of slice_time) temp[each]++;
      chrome.storage.local.set({ time: temp }, () => {
        chrome.storage.local.get('time', items => {
          // console.log(items);
        });
      });
    }
  });
}

function checkConflict(time_array, callback) {
  chrome.storage.local.get('time', items => {
    if (time_array == 'empty') callback();
    let conflict = false;
    if (items.time != undefined) {
      for (let each of time_array) {
        if (items.time[each] != 0 && each != '無') conflict = true;
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

function removeTimeOfCourse(time_array) {
  chrome.storage.local.get('time', items => {
    let temp = {};
    Object.assign(temp, items.time);
    for (let each of time_array) temp[each]--;

    chrome.storage.local.remove('time', () => {
      chrome.storage.local.set({ time: temp }, () => {
        chrome.storage.local.get('time', items => {
          // console.log(items);
        });
      });
    });
  });
}

// TODO: 改成存 Variable，這樣也不用每次清
function clearAllTime() {
  chrome.storage.local.remove('time');
}

export { storeSliceTime, checkConflict, removeTimeOfCourse, clearAllTime };
