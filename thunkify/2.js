const thunkify = require("thunkify");

function sleep(timeout, fn) {
  setTimeout(() => {
    fn(Math.random() * 10000, 123123);
  }, timeout);
}

const Thunk = (fn) => {
  return (...args) => {
    return (callback) => {
      return fn.call(this, ...args, callback);
    };
  };
};

const thunkSleep = thunkify(sleep);

let sleepYield = function* () {
  let t = Math.random() * 10000;
  console.info(t);
  let t1 = yield thunkSleep(t);
  console.info(t1);
  let t2 = yield thunkSleep(t1);
  console.info(t2);
};

function run(fn) {
  let gen = fn();
  function next(data) {
    let result = gen.next(data);
    if (result.done) return;
    result.value(next);
  }

  next();
}

run(sleepYield);
