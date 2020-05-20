const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uuid = require("uuid");
const cors = require("cors");
const cluster = require("cluster");
const Busboy = require("busboy");
const appendField = require("append-field");
const ReadableStream = require("stream").Readable;
const inherits = require("util").inherits;

function FileStream(opts) {
  if (!(this instanceof FileStream)) return new FileStream(opts);
  ReadableStream.call(this, opts);

  this.truncated = false;
}
inherits(FileStream, ReadableStream);

FileStream.prototype._read = function (n) {};

////////--------------------------------------------------/////////

const EventEmitter = require("events");
class Emitter extends EventEmitter {}
const emitter = new Emitter();

const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
); // for parsing application/x-www-form-urlencoded
app.use(cors()); //跨域
app.use(cookieParser());

// 创建文件夹
function mkdirsSync(filePath) {
  let array = filePath.split("/");
  let _p = "";
  array.forEach((data) => {
    _p += data + "/";
    if (!fs.existsSync(_p)) fs.mkdirSync(_p);
  });
}

function getNowTempPath() {
  // `uploads/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/temp`
  return `uploads/temp`;
}

function getNowTempPath2() {
  // `uploads/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/temp`
  return `uploads/temp2`;
}

// 获取文件后缀
function nameSuffix(originalname) {
  let names = originalname.split(".");
  return names[names.length - 1];
}

// 合并分片文件 逐个读取写入
async function fileMerge(target, result) {
  let files = [];
  if (fs.existsSync(result)) {
    files = fs.readdirSync(result);
    if (files && files.length) {
      // console.info(path.join(`${target}.${nameSuffix(files[0])}`));
      let cws = fs.createWriteStream(path.join(`${target}.${nameSuffix(files[0])}`), {
        highWaterMark: 2 * 1024 * 1024, // 2 * 1024 * 1024
      });
      for (let index = 0; index < files.length; index++) {
        await forEachWrite(cws, result, files[index]);
      }
      cws.close();
    }
  }
}

async function forEachWrite(cws, result, item) {
  return new Promise((resolve, reject) => {
    let crs = fs.createReadStream(path.join(result, item), {
      highWaterMark: 2 * 1024 * 1024, // 2 * 1024 * 1024
    });
    crs.on("data", (chunk) => {
      cws.write(chunk);
    });
    crs.on("error", (err) => {
      crs.close();
      reject(err);
    });
    crs.on("end", () => {
      crs.close();
      resolve();
    });
  });
}

// 合并分片文件
// function fileMerge(target, result) {
//   return new Promise((resolve, reject) => {
//     let files = [];
//     if (fs.existsSync(result)) {
//       files = fs.readdirSync(result);
//       if (files && files.length) {
//         let filePath = path.join(`${target}.${nameSuffix(files[0])}`);
//         fs.writeFileSync(filePath);
//         const forEachWrite = function (index, array) {
//           console.info(path.join(result, array[index]))
//           fs.appendFileSync(filePath, fs.readFileSync(path.join(result, array[index])));
//           if (index < array.length - 1) {
//             forEachWrite(++index, array);
//           } else {
//             resolve();
//           }
//         };
//         forEachWrite(0, files);
//       }
//     }
//   });
// }

// 还是不行  看来要自己写流了
// function fileMerge(target, result) {
//   return new Promise((resolve, reject) => {
//     let files = [];
//     if (fs.existsSync(result)) {
//       files = fs.readdirSync(result);
//       if (files && files.length) {
//         let cws = fs.createWriteStream(path.join(`${target}.${nameSuffix(files[0])}`));
//         const forEachWrite = (index, array) => {
//           let crs = fs.createReadStream(path.join(result, array[index])).pipe(cws);
//           if (index < array.length - 1) {
//             forEachWrite(++index, array);
//           } else {
//             cws.close();
//             // crs.close();
//             resolve();
//           }
//         };
//         forEachWrite(0, files);
//       }
//     }
//   });
// }

// 合并分片文件 注意文件顺序
/* function fileMerge(target, result) {
  return new Promise((resolve, reject) => {
    let files = [];
    if (fs.existsSync(result)) {
      files = fs.readdirSync(result);
      if (files && files.length) {
        // 读取highWaterMark(3字节)数据，读完之后填充缓存区，然后触发data事件
        let cws = fs.createWriteStream(path.join(`${target}.${nameSuffix(files[0])}`), {
          highWaterMark: 1024 * 1024,
        });

        const forEachWrite = (index, array) => {
          let crs = fs.createReadStream(path.join(result, array[index]), {
            highWaterMark: 1024 * 1024,
          });
          // 当有数据流出时，写入数据
          crs.on("data", chunk => {
            if (cws.write(chunk) === false) {
              // 如果没有写完，暂停读取流
              crs.pause();
            }
          });
          // 缓冲区清空触发drain事件 这时再继续读取
          cws.on("drain", () => {
            crs.resume();
          });

          crs.on("error", err => {
            console.info(err);
            cws.close();
            crs.close();
            reject();
          });
          crs.on("end", () => {
            if (index < array.length - 1) {
              forEachWrite(++index, array);
            } else {
              cws.close();
              crs.close();
              resolve();
            }
          });
        };
        forEachWrite(0, files);
      }
    }
  });
} */

// function fileMerge(target, result) {
//   return new Promise((resolve, reject) => {
//     let files = [];
//     if (fs.existsSync(result)) {
//       files = fs.readdirSync(result);
//       if (files && files.length) {
//         let cws = fs.createWriteStream(path.join(`${target}.${nameSuffix(files[0])}`), {
//           highWaterMark: 1024 * 1024,
//         });

//         cws.once("open", () => {
//           forEachWrite(0, files);
//         });

//         const drainList = [];

//         cws.on("drain", () => {
//           let crs = drainList.pop();
//           if (crs) crs.resume();
//         });

//         emitter.on("drain", fn => {
//           drainList.push(fn());
//         });

//         const forEachWrite = (index, array) => {
//           let crs = fs.createReadStream(path.join(result, array[index]), {
//             highWaterMark: 1024 * 1024 * 2,
//           });

//           crs.on("data", chunk => {
//             if (cws.write(chunk) === false) {
//               // 如果没有写完，暂停读取流
//               crs.pause();

//               drainList.push();
//               emitter.emit("drain", () => {
//                 return crs;
//               });
//             }
//           });

//           crs.on("end", () => {
//             if (index < array.length - 1) {
//               forEachWrite(++index, array);
//             } else {
//               crs.close();
//               cws.close();
//               resolve();
//             }
//           });
//         };
//       }
//     }
//   });
// }

//删除文件夹下的所有文件或文件夹
function deleteFolderRecursive(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach((file) => {
      let curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

// 上传配置
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = getNowTempPath();
    mkdirsSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuid.v4()}.${nameSuffix(file.originalname)}`);
  },
});

let upload = multer({
  storage: storage,
  limits: {},
  fileFilter: (req, file, cb) => {
    cb(null, true);
  },
});

let routeFile = express.Router();

// ------------------------------------------
function busboyFun() {
  let rs = new ReadableStream();
  return function (req, res, next) {
    let busboy = new Busboy({ headers: req.headers });
    busboy.on("field", (fieldname, value, fieldnameTruncated, valueTruncated) => {
      appendField(req.body, fieldname, value);
    });
    busboy.on("file", (fieldname, fileStream, filename, encoding, mimetype) => {
      // mkdirsSync(getNowTempPath2());
      // let cws = fs.createWriteStream(path.join(getNowTempPath2(), uuid.v4()));
      fileStream.on("data", (data) => {
        // cws.write(data);
        rs.push(data);
      });
      // fileStream.on("end", () => {
      //   console.info(req.body);
      //   cws.close();
      // });

      appendField(req, "file", {
        fieldname: fieldname,
        originalname: filename,
        encoding: encoding,
        mimetype: mimetype,
      });
    });

    busboy.on("finish", () => {
      mkdirsSync(getNowTempPath());

      let { chunkIndex, chunkCount, md5 } = req.body;
      let { fieldname, originalname, encoding, mimetype } = req.file;

      // let cws = fs.createWriteStream(path.join(getNowTempPath(), uuid.v4()));

      rs.on("data", (data) => {
        console.info(data);
      });

      req.unpipe(busboy);
      next();
    });

    req.pipe(busboy);
  };
}

routeFile.post("/upload", busboyFun(), (req, res) => {
  res.send({
    code: 200,
    data: req.body,
  });
});
// ------------------------------------------

// routeFile.post("/upload", upload.any(), (req, res) => {
//   if (!cluster.isMaster) {
//     process.send({ event: "upload", pid: process.pid });
//   }

//   let { chunkIndex, chunkCount, md5 } = req.body;
//   let { originalname, fieldname, filename, destination, size, path: _path } = req.files[0];

//   if (chunkCount == 1) {
//     fs.renameSync(_path, path.join(path.join(destination, "../"), `${md5}.${nameSuffix(filename)}`));
//     res.send({
//       code: 200,
//     });
//   } else {
//     const chunksPath = path.join(destination, md5, "/");
//     if (!fs.existsSync(chunksPath)) mkdirsSync(chunksPath);

//     // 保证文件顺序 可能不同的系统排序方式会不一样 可能有坑 解决办法 手动生成文件名 逐个读取
//     fs.renameSync(
//       _path,
//       path.join(
//         chunksPath,
//         `${String(chunkIndex).padStart(String(+chunkCount + 1).length, "0")}-${md5}.${nameSuffix(filename)}`
//       )
//     );
//     res.send({
//       code: 200,
//     });
//   }
// });

// 合并分片
routeFile.post("/merge", (req, res) => {
  if (!cluster.isMaster) {
    process.send({ event: "merge", pid: process.pid });
  }

  let { md5 } = req.body;
  let uploadPath = getNowTempPath();
  let target = path.join(path.join(uploadPath, "../"), md5);
  let result = path.join(uploadPath, md5);
  fileMerge(target, result).then(() => {
    deleteFolderRecursive(result);
    console.info("合并完成");
    res.send({
      code: 200,
      md5,
    });
  });
});

// 断点续传
routeFile.post("/renewal", (req, res) => {
  if (!cluster.isMaster) {
    process.send({ event: "renewal", pid: process.pid });
  }

  let { md5 } = req.body;
  let uploadPath = getNowTempPath();

  let _path = path.join(uploadPath, md5, "/");
  let renewalList = [];
  if (fs.existsSync(_path)) {
    let files = fs.readdirSync(_path);
    files.forEach((file) => {
      renewalList.push(parseInt(file.substr(0, file.indexOf("-"))));
    });
    res.send({
      code: 200,
      data: renewalList.sort((a, b) => a - b),
      md5,
    });
  } else {
    res.send({
      code: 200,
      data: renewalList,
      md5,
    });
  }
});

app.use("/file", routeFile);

app.listen(3000);
