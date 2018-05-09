var elasticsearch = require("elasticsearch");
var client = new elasticsearch.Client({
  host: "http://localhost:9200",
});
client.ping(
  {
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
  },
  function(error) {
    if (error) {
      console.trace("Elasticsearch cluster is down");
    } else {
      console.log("Elasticsearch is well");
    }
  }
);

function searchByKeyword(keyword) {
  client
    .search({
      index: "nthu",
      type: "course",
      body: {
        query: {
          match: {
            課程中文名稱: keyword
          }
        }
      }
    })
    .then(
      function(resp) {
        var hits = resp.hits.hits;
        console.log(hits);
      },
      function(err) {
        console.trace(err.message);
      }
    );
}

export { searchByKeyword };
