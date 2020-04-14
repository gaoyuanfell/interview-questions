self.addEventListener(
  "message",
  (event) => {
    console.info(event.data.toString());
    var a = new TextDecoder("utf-8").decode(event.data);
    console.info(a);
  },
  false
);
