// import {
//   searchBySingleCourseNo,
//   searchByID_Group,
//   storeCourseInfo
// } from "./search";
// import { getSimilarities_forRecommend } from "./server";
// import { oldyear_to_newyear } from "./helper";
// import { getCourseDescription } from "./api";
// const num_of_old_course = 3;
// const num_of_each_similar = 3;
// var before_hits_group = [];
// let compare_group = [];

// function sortObject(obj) {
//   var arr = [];
//   for (var prop in obj) {
//     if (obj.hasOwnProperty(prop) && obj[prop] < 1) {
//       arr.push({
//         key: prop,
//         value: obj[prop]
//       });
//     }
//   }
//   arr.sort(function(a, b) {
//     return b.value - a.value;
//   });
//   return arr;
// }

// function sortComplexObject(obj, pr_value) {
//   var arr = [];
//   for (var prop in obj) {
//     var sim = obj[prop].sim;
//     if (obj.hasOwnProperty(prop)) {
//       arr.push({
//         key: sim.other,
//         value: sim.percent * pr_value
//       });
//     }
//   }
//   arr.sort(function(a, b) {
//     return b.value - a.value;
//   });
//   return arr;
// }

// function getRecommendPage(callback) {
//   $("#recommend_loading").addClass("active");
//   $("#recommend_list").empty();
//   chrome.storage.local.get("pr", function(items) {
//     if (items.pr != undefined) {
//       var sort_pr = sortObject(items.pr);
//       for (
//         let course_number = 0;
//         course_number < num_of_old_course;
//         course_number++
//       ) {
//         let pr_key = sort_pr[course_number].key;
//         let pr_value = sort_pr[course_number].value;
//         let new_course_no = oldyear_to_newyear(pr_key);
//         searchBySingleCourseNo(new_course_no, function(hits) {
//           if (hits.length > 0) {
//             getSimilarities_forRecommend(hits[0]._id, function(info) {
//               let sort_pr_and_percent = sortComplexObject(info, pr_value);
//               let id_group = [];
//               for (let each = 0; each < num_of_each_similar; each++) {
//                 let other_id = sort_pr_and_percent[each].key;
//                 let compare_value = sort_pr_and_percent[each].value;
//                 compare_group.push({
//                   other_id,
//                   compare_value
//                 });
//                 id_group.push({
//                   other_id,
//                   compare_value
//                 });
//               }
//               searchByID_Group(id_group, function(hits) {
//                 for (let i = 0; i < num_of_each_similar; i++)
//                   before_hits_group.push(hits[i]);
//                 callback();
//               });
//             });
//           }
//         });
//       }
//     }
//   });
// }

// function toStorage(callback) {
//   // console.log("before_hits_group");
//   // console.log(before_hits_group);
//   var hits_group = [];
//   for (var each_row in before_hits_group) {
//     var row = before_hits_group[each_row];
//     hits_group.push(row);
//   }
//   // console.log("after_hits_group");
//   // console.log(hits_group);
//   // console.log("compare_group");
//   // console.log(compare_group);
//   storeCourseInfo(hits_group, function() {
//     for (
//       let count = 0;
//       count < num_of_old_course * num_of_each_similar;
//       count++
//     ) {
//       let id = hits_group[count]._id;
//       let source = hits_group[count]._source;
//       let course_no = source.科號;
//       getCourseDescription(course_no, function(description) {
//         let match = compare_group.find(function(item) {
//           return item.other_id == id;
//         });
//         description = description.slice(0, 60).concat(" ．．．");
//         let content =
//           `<div id="` +
//           id +
//           `" course_no="` +
//           course_no +
//           `" compare_value="` +
//           match.compare_value +
//           `" class="item column">
//                   <div class="ui link fluid card" style="height:200px;">
//                       <div class="content">
//                           <div class="header">` +
//           source.課程中文名稱 +
//           `</div>
//                           <div class="meta">
//                               <span class="date">` +
//           source.科號 +
//           `</span>
//                           </div>
//                           <div class="description">
//                               ` +
//           description +
//           `
//                           </div>
//                       </div>
//                   </div>
//               </div>`;
//         callback(content, count, match.compare_value);
//       });
//     }
//   });
// }

// $("#recommend_list").on("click", ".item", function() {
//   let course_no = $(this).attr("course_no");
//   let id = $(this).attr("id");
//   getCourseInfo(
//     course_no,
//     id,
//     function() {
//       $(".course_action").hide();
//       $("#submit").show();
//       $("#back").show();
//       $("#course_info_loading").removeClass("active");
//     },
//     false
//   );
// });

// export {
//   getRecommendPage,
//   toStorage,
//   before_hits_group,
//   compare_group,
//   num_of_old_course,
//   num_of_each_similar
// };
