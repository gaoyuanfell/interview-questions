// 将 某个属性访问代理到某个属性成员上
function proxy(target, prop, key) {}

let ARRAY_METHOD = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];

let array_methods = Object.create(Array.prototype);

ARRAY_METHOD.forEach((method) => {
  array_methods[method] = function () {
    for (let i = 0; i < arguments.length; i++) {
      observe(arguments[i]);
    }
    return Array.prototype[method].apply(this, arguments);
  };
});

function observe(obj) {
  if (Array.isArray(obj)) {
    obj.__proto__ = array_methods;
    for (let i = 0; i < obj.length; i++) {
      observe(obj[i]);
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      defineReactive(obj, key, value, true);
    }
  }
}

function defineReactive(target, key, value, enumerable) {
  if (typeof value === "object" && value != null) {
    observe(value);
  }

  const dep = new Dep();

  Object.defineProperty(target, key, {
    configurable: true,
    enumerable: !!enumerable,
    get() {
      console.info("get:", value);
      Dep.target && dep.addDep(Dep.target);
      return value;
    },
    set(newValue) {
      if (typeof newValue === "object" && newValue != null) {
        observe(newValue);
      }
      console.info("set:", newValue);
      value = newValue;
      dep.notify();
    },
  });
}
