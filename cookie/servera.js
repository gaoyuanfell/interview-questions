const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
); // for parsing application/x-www-form-urlencoded
// app.use(cors()); //跨域
app.use(cookieParser());

let route = express.Router();

route.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "a.html"));
});

route.get("/b", (req, res) => {
  console.info(req.cookies);
  res.send({ code: 200 });
});

app.use("/a", route);

app.listen(3000);
