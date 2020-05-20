const WebSocketServer = require("ws").Server;
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
); // for parsing application/x-www-form-urlencoded
app.use(cors()); //跨域
app.use(cookieParser("moka"));

app.use(express.static("./"));

const options = {
  key: fs.readFileSync("./privatekey.pem"),
  cert: fs.readFileSync("./certificate.pem"),
};

const server = https.createServer(options, app);

const wss = new WebSocketServer({ server });

// const map = new Map();

wss.on("connection", (ws) => {
  // console.info(wss.clients.size);

  ws.on("message", (message) => {
    message = JSON.parse(message);
    //打印客户端监听的消息
    switch (message.type) {
      case "userMedia":
        ws.send(
          JSON.stringify({
            type: "userMedia",
          })
        );
        break;
      case "offer":
        wss.clients.forEach((clien) => {
          if (clien !== ws) clien.send(JSON.stringify(message));
        });
        break;
      case "answer":
        wss.clients.forEach((clien) => {
          if (clien !== ws) clien.send(JSON.stringify(message));
        });
        break;
      case "candidate":
        wss.clients.forEach((clien) => {
          if (clien !== ws) clien.send(JSON.stringify(message));
        });
        break;
    }
  });
});

server.listen(8081);
