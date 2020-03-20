const obj = {
  a: 1,
  b: function() {
    console.info(++this.a);
  },
};

module.exports = obj;
