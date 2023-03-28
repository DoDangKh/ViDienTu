const bp = require("body-parser");
//cors
const cors = require("cors");
const https = require(`https`);
const fs = require(`fs`);

// const options = {
//   key: fs.readFileSync('cert', `key.pem`),
//   cert: fs.readFileSync('cert', `cert.pem`)
// };

app.get("/", (req, res) => {
  res.send("Heollo World");
  app.use(bp.urlencoded({ extended: true }));
  app.use(cors()); //cross site orgin resource sharing
  initAPIRoute(app);
});
// https.createServer(options, (req, res) => {
//   res.writeHead(200);
//   res.end(`hello world\n`);
// }).listen(5000);
app.listen(port, () => {
  console.log("Example app listening " + port);
});
