var request = window.indexedDB.open("moka", 1);

request.onerror = function (event) {
  console.log("数据库打开报错");
};

var db;

request.onsuccess = function (event) {
  db = request.result;
  console.log("数据库打开成功");
  function add() {
    db
      .transaction(["person"], "readwrite")
      .objectStore("person")
      .add({ id: 1, name: "张三", age: 24, email: "zhangsan@example.com" }).onsuccess = function (event) {
      console.log("数据写入成功");
    };
    db
      .transaction(["person"], "readwrite")
      .objectStore("person")
      .add({ id: 2, name: "张三", age: 24, email: "zhangsan@example.com" }).onsuccess = function (event) {
      console.log("数据写入成功");
    };
    db
      .transaction(["person"], "readwrite")
      .objectStore("person")
      .add({ id: 3, name: "张三", age: 24, email: "zhangsan@example.com" }).onsuccess = function (event) {
      console.log("数据写入成功");
    };

    // request.onsuccess = function (event) {
    //   console.log("数据写入成功");
    // };

    // request.onerror = function (event) {
    //   console.log(event);
    //   console.log("数据写入失败");
    // };
  }

  add();

  function read() {
    var transaction = db.transaction("person");
    var objectStore = transaction.objectStore("person");
    var request = objectStore.index("name").get("张三");

    request.onerror = function (event) {
      console.log("事务失败");
    };

    request.onsuccess = function (event) {
      if (request.result) {
        console.log("Name: " + request.result.name);
        console.log("Age: " + request.result.age);
        console.log("Email: " + request.result.email);
      } else {
        console.log("未获得数据记录");
      }
    };
  }

  read();

  function readAll() {
    var objectStore = db.transaction("person").objectStore("person");

    console.dir(objectStore.openCursor);
    objectStore.openCursor(0, 1).onsuccess = function (event) {
      var cursor = event.target.result;

      if (cursor) {
        console.log("Id: " + cursor.key);
        console.log("Name: " + cursor.value.name);
        console.log("Age: " + cursor.value.age);
        console.log("Email: " + cursor.value.email);
        cursor.continue();
      } else {
        console.log("没有更多数据了！");
      }
    };

    objectStore.getAll().onsuccess = function (event) {
      console.log("Got all customers: " + JSON.stringify(event.target.result));
    };
  }

  readAll();

  function update() {
    var request = db
      .transaction(["person"], "readwrite")
      .objectStore("person")
      .put({ id: 1, name: "李四", age: 35, email: "lisi@example.com" });

    request.onsuccess = function (event) {
      console.log("数据更新成功");
    };

    request.onerror = function (event) {
      console.log("数据更新失败");
    };
  }

  update();

  function update() {
    var request = db
      .transaction("person", "readwrite")
      .objectStore("person")
      .put({ id: 1, name: "李四", age: 35, email: "lisi@example.com" });

    request.onsuccess = function (event) {
      console.log("数据更新成功");
    };

    request.onerror = function (event) {
      console.log("数据更新失败");
    };
  }

  update();

  function remove() {
    var request = db.transaction("person", "readwrite").objectStore("person").delete(1);

    request.onsuccess = function (event) {
      console.log("数据删除成功");
    };
  }

  remove();
};

request.onupgradeneeded = function (event) {
  db = event.target.result;
  console.log("数据库更新了");
  var objectStore;
  if (!db.objectStoreNames.contains("person")) {
    objectStore = db.createObjectStore("person", { keyPath: "id" });
    objectStore.createIndex("name", "name", { unique: false });
  }
};
