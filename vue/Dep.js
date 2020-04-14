class Dep {
  constructor() {
    this.deps = [];
  }

  addDep(dep) {
    this.deps.push(dep);
  }

  notify() {
    this.deps.forEach((dep) => dep.update());
  }
}

let targetStack = [];

function pushTarget(target) {
  targetStack.unshift(Dep.target);
  Dep.target = target;
}

function popTarget() {
  Dep.target = targetStack.shift();
}
