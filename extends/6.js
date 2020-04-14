// function inheritPrototype(subType, superType) {
//   var prototype = Object.create(superType.prototype); //创建对象
//   prototype.constructor = subType; //增强对象
//   subType.prototype = prototype; //指定对象
// }

// function SuperType(name) {
//   this.name = name;
//   this.colors = ["red", "blue", "green"];
// }
// SuperType.prototype.sayName = function () {
//   alert(this.name);
// };
// function SubType(name, age) {
//   SuperType.call(this, name);
//   this.age = age;
// }

// inheritPrototype(SubType, SuperType);

// console.dir(new SubType("张三", 20));

// process.nextTick(function A() {
//   console.log(1);
//   process.nextTick(function B() {
//     console.log(5);
//   });
//   process.nextTick(function B() {
//     console.log(2);
//     process.nextTick(function B() {
//       console.log(3);
//       process.nextTick(function B() {
//         console.log(4);
//       });
//     });
//   });
// });

// setTimeout(function timeout() {
//   console.log("TIMEOUT FIRED");
// }, 0);

setImmediate(function A() {
  console.log(1);
  setImmediate(function B() {
    console.log(2);
  });
});

setTimeout(function timeout() {
  console.log("TIMEOUT FIRED");
}, 0);

process.nextTick(function B() {
  console.log(3);
});
