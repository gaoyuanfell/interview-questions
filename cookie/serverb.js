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
app.use(cookieParser("moka"));

let route = express.Router();

route.get("/", (req, res) => {
  res.cookie("b", 1, {
    httpOnly: true, // 阻止通过javascript访问cookie
    signed: true,
    expires: new Date("2020-04-23: 00:00:00"),
    secure: false, // cookie只会被https传输 (boolean或null)。
    sameSite: "none", // 浏览器的 Cookie 新增加了一个SameSite属性，用来防止 CSRF 攻击和用户追踪。
    // maxAge: 10000,
    // domain: "http://localhost:3001",
    path: "/",
    // maxAge: 10000,
  });
  res.sendFile(path.join(__dirname, "b.html"));
});

route.get("/a", (req, res) => {
  console.info(req.cookies);
  console.info(req.signedCookies);
  res.send({ code: 200 });
});

app.use("/b", route);

app.listen(3001);
