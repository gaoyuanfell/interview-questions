class Watcher {
  constructor(vm, cb) {}

  get() {
    pushTarget(this);
  }
}
