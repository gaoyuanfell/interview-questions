const path = require("path");
const fs = require("fs");
const EventEmitter = require("events");
class Emitter extends EventEmitter {}
const emitter = new Emitter();

let md5 = "fbe2c3e88a6dfd8542af9285eb119f46";

function getNowTempPath() {
  return `uploads/temp`;
}

// 获取文件后缀
function nameSuffix(originalname) {
  let names = originalname.split(".");
  return names[names.length - 1];
}

let uploadPath = getNowTempPath();
let target = path.join(path.join(uploadPath, "../"), md5);
let result = path.join(uploadPath, md5);

if (fs.existsSync(result)) {
  let files = fs.readdirSync(result);

  let cws = fs.createWriteStream(path.join(`${target}.${nameSuffix(files[0])}`), {
    highWaterMark: 1024 * 1024,
  });

  let index = 0;

  cws.once("open", () => {
    forEachWrite(index, files);
  });

  const drainList = [];

  cws.on("drain", () => {
    let crs = drainList.pop();
    if (crs) crs.resume();
  });

  emitter.on("drain", fn => {
    drainList.push(fn());
  });

  const forEachWrite = (index, array) => {
    let crs = fs.createReadStream(path.join(result, array[index]), {
      highWaterMark: 1024 * 1024 * 2,
    });

    crs.on("data", chunk => {
      if (cws.write(chunk) === false) {
        // 如果没有写完，暂停读取流
        crs.pause();

        drainList.push();
        emitter.emit("drain", () => {
          return crs;
        });
      }
    });

    crs.on("end", () => {
      if (index < array.length - 1) {
        forEachWrite(++index, array);
      } else {
        crs.close();
        cws.close();
        console.info("end");
      }
    });
  };
}
