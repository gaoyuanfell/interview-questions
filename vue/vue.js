class Vue {
  constructor(options) {
    this.options = options;
    this.data = options.data;
    observe(this.data);

    if (options.created) {
      options.created.call(this);
    }
  }
}
