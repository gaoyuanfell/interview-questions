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
app.use(bodyParser.urlencoded({
  extended: false
})); // for parsing application/x-www-form-urlencoded
app.use(cors()); //跨域
app.use(cookieParser());

function mkdirsSync(filePath) {
  let array = filePath.split("/");
  let _p = "";
  array.forEach(data => {
    _p += data + "/";
    if (!fs.existsSync(_p)) fs.mkdirSync(_p);
  });
}

function nameSuffix(originalname) {
  let names = originalname.split(".");
  return names[names.length - 1];
}


function fileCount(target, files) {
  return new Promise((resolve, reject) => {
    let cws = fs.createWriteStream(target)
    const forEachWrite = function (index, array, writeStream) {
      let s = fs.createReadStream(array[index])
      s.on('data', (chunk) => {
        writeStream.write(chunk)
      })
      s.on('error', function () {
        writeStream.close()
        reject()
      })
      s.on('end', () => {
        if (index < array.length - 1) {
          forEachWrite(++index, array, writeStream);
        } else {
          writeStream.close()
          resolve()
        }
      })
    }
    forEachWrite(0, files, cws);
  })
}

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

// 上传
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let date = new Date();
    let uploadPath = `uploads/${date.getFullYear()}/${date.getMonth() +
      1}/${date.getDate()}/temp`;
    mkdirsSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuid.v4()}.${nameSuffix(file.originalname)}`);
  }
});

let upload = multer({
  storage: storage,
  limits: {},
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});

let routeFile = express.Router();

routeFile.post("/upload", upload.any(), (req, res) => {
  let {
    chunkIndex,
    chunkCount,
    md5
  } = req.body;
  let {
    originalname,
    fieldname,
    filename,
    destination,
    size,
    path: _path
  } = req.files[0];

  if (chunkCount == 1) {
    fs.renameSync(
      _path,
      path.join(path.join(destination, "../"), `${md5}.${nameSuffix(filename)}`)
    );
  } else {
    const chunksPath = path.join(destination, md5, "/");
    if (!fs.existsSync(chunksPath)) mkdirsSync(chunksPath);

    fs.renameSync(
      _path,
      path.join(chunksPath, `${chunkIndex}-${md5}.${nameSuffix(filename)}`)
    );
  }
  res.send({
    code: 200,
    destination,
    filename,
    originalname,
    chunkCount
  });
});

routeFile.post("/merge", (req, res) => {
  let {
    md5,
    destination,
    filename,
    chunkCount,
  } = req.body;

  let files = [];
  const chunksPath = path.join(destination, md5, "/");
  for (let i = 0; i < chunkCount; i++) {
    files.push(path.join(chunksPath, `${i}-${md5}.${nameSuffix(filename)}`))
  }
  let target = path.join(path.join(destination, "../"), `${md5}.${nameSuffix(filename)}`)

  fileCount(target, files).then(() => {
    console.info('合并完成')
    deleteFolderRecursive(chunksPath)
    res.send({
      code: 200,
      md5
    });
  })

});

app.use("/file", routeFile);

app.listen(3000);