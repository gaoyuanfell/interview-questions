(() => {
    async function* gen() {
        yield "123";
        yield "456";
        yield "789";
      }
      
      for await (let item of gen()) {
        console.info(item);
      }
})()
