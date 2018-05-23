import { searchBySingleCourseNo } from "./search";
import { getSimilarities } from "./server";

function getRecommendPage() {
  chrome.storage.local.get("pr", function(items) {
    if (items.pr != undefined) {
      for (let course_no in items.pr) {
        let pr_value = items.pr[course_no];
        // TODO: 找出類似課程，乘上 PR 值並排序
        // searchBySingleCourseNo(course_no, function(hits) {
          // console.log("course_no:", course_no);
          // console.log("course id:", hits[0]._id);
          // getSimilarities(hits[0]._id, function(info) {
          //   for (let each in info) {
          //     console.log(info[each]);
          //   }
          // });
        // });
      }
    }
  });
}

export { getRecommendPage };
