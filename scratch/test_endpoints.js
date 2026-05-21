import http from "http";

function testUrl(url) {
  console.log(`Testing URL: ${url}`);
  http
    .get(url, (res) => {
      console.log(`STATUS: ${res.statusCode}`);
      console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);
      res.setEncoding("utf8");
      let rawData = "";
      res.on("data", (chunk) => {
        rawData += chunk;
      });
      res.on("end", () => {
        try {
          console.log(`Body length: ${rawData.length}`);
          if (rawData.length < 1000) {
            console.log(`Response: ${rawData}`);
          } else {
            console.log(`Response snippet: ${rawData.substring(0, 500)}`);
          }
        } catch (e) {
          console.error(e.message);
        }
      });
    })
    .on("error", (e) => {
      console.error(`Got error: ${e.message}`);
    });
}

testUrl("http://localhost:3000/api/rest/openapi.json");
