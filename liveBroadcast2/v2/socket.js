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

const map = new WeakMap();

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    message = JSON.parse(message);
    console.info(message);
    switch (message.type) {
      case "roomIn":
        let client;
        if (!map.has(message.data.id)) {
          client = [];
          map.set(message.data.id, client);
          client.push({
            socket: ws,
          });
        } else {
          client = map.get(message.data.id);
        }
        break;
    }
  });
  ws.on("close", () => {
    console.info("close");
  });
});

server.listen(8081);
