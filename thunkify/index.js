const Thunk = (fn) => {
  return (...args) => {
    return (callback) => {
      return fn.call(this, ...args, callback);
    };
  };
};

var fs = require("fs");

var read = Thunk(fs.readFile);
// read("package.json")(function (err, str) {
//   console.info(str.toString());
// });

var gen = function* () {
  var r1 = yield read("package.json");
  console.log(r1.toString());
  var r2 = yield read("package.json");
  console.log(r2.toString());
};

function run(fn) {
  var gen = fn();

  function next(err, data) {
    console.info(1);
    var result = gen.next(data);
    if (result.done) return;
    result.value(next);
  }

  next();
}

run(gen);
