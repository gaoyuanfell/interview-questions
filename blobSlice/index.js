const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const uuid = require("uuid");
const cors = require("cors");
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
  array.forEach(data => {
    _p += data + "/";
    if (!fs.existsSync(_p)) fs.mkdirSync(_p);
  });
}

function getNowTempPath() {
  // `uploads/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}/temp`
  return `uploads/temp`;
}

// 获取文件后缀
function nameSuffix(originalname) {
  let names = originalname.split(".");
  return names[names.length - 1];
}

// 合并分片文件
function fileMerge(target, result) {
  return new Promise((resolve, reject) => {
    let files = [];
    if (fs.existsSync(result)) {
      files = fs.readdirSync(result);
      if (files && files.length) {
        let filePath = path.join(`${target}.${nameSuffix(files[0])}`);
        fs.writeFileSync(filePath);
        const forEachWrite = function(index, array) {
          fs.appendFileSync(filePath, fs.readFileSync(path.join(result, array[index])));
          if (index < array.length - 1) {
            forEachWrite(++index, array);
          } else {
            resolve();
          }
        };
        forEachWrite(0, files);
      }
    }
  });
}

//无序的 废弃
/* function fileMerge(target, result) {
  return new Promise((resolve, reject) => {
    let files = [];
    if (fs.existsSync(result)) {
      files = fs.readdirSync(result);
      if (files && files.length) {
        let cws = fs.createWriteStream(path.join(`${target}.${nameSuffix(files[0])}`));
        const forEachWrite = function(index, array, writeStream) {
          let s = fs.createReadStream(path.join(result, array[index]));
          s.on("data", chunk => {
            writeStream.write(chunk);
          });
          s.on("error", function(err) {
            console.info(err);
            writeStream.close();
            reject();
          });
          s.on("end", () => {
            if (index < array.length - 1) {
              forEachWrite(++index, array, writeStream);
            } else {
              writeStream.close();
              resolve();
            }
          });
        };

        forEachWrite(0, files, cws);
      }
    }
  });
} */

//删除文件夹下的所有文件或文件夹
function deleteFolderRecursive(path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(file => {
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
  destination: function(req, file, cb) {
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

routeFile.post("/upload", upload.any(), (req, res) => {
  let { chunkIndex, chunkCount, md5 } = req.body;
  let { originalname, fieldname, filename, destination, size, path: _path } = req.files[0];

  if (chunkCount == 1) {
    fs.renameSync(_path, path.join(path.join(destination, "../"), `${md5}.${nameSuffix(filename)}`));
    res.send({
      code: 200,
    });
  } else {
    const chunksPath = path.join(destination, md5, "/");
    if (!fs.existsSync(chunksPath)) mkdirsSync(chunksPath);
    fs.renameSync(_path, path.join(chunksPath, `${chunkIndex}-${md5}.${nameSuffix(filename)}`));
    res.send({
      code: 200,
    });
  }
});

// 合并分片
routeFile.post("/merge", (req, res) => {
  let { md5 } = req.body;
  let uploadPath = getNowTempPath();
  let target = path.join(path.join(uploadPath, "../"), md5);
  let result = path.join(uploadPath, md5);
  fileMerge(target, result).then(() => {
    console.info("合并完成");
    deleteFolderRecursive(result);
    res.send({
      code: 200,
      md5,
    });
  });
});

// 断点续传
routeFile.post("/renewal", (req, res) => {
  let { md5 } = req.body;
  let uploadPath = getNowTempPath();

  let _path = path.join(uploadPath, md5, "/");
  let renewalList = [];
  if (fs.existsSync(_path)) {
    let files = fs.readdirSync(_path);
    files.forEach(file => {
      console.info(file.substr(0, file.indexOf("-")));
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
