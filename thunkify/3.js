function sum(x, y) {
  "use strict";
  if (y <= 0) {
    return x;
  }
  return sum(x + 1, y - 1);
}

Promise.resolve();

class AA {
  constructor() {}

  test(a = 1) {
    console.info(a);
  }
}
