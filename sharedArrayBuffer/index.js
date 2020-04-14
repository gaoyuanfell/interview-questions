var worker = new Worker("work.js");

var ab = new ArrayBuffer();
// var sab = new SharedArrayBuffer();

var uInt8Array = new Uint8Array(new ArrayBuffer(10));
for (var i = 0; i < uInt8Array.length; ++i) {
  uInt8Array[i] = i * 2; // [0, 2, 4, 6, 8,...]
}

// worker.postMessage(sab, [sab]);

worker.onmessage = function (event) {
  console.log(event);
};

let fileRef = document.querySelector("#file");
fileRef.addEventListener("change", (event) => {
  let file = event.target.files[0];
  console.info(file);
  console.info();
  file.arrayBuffer().then((res) => {
    worker.postMessage(res, [res]);
  });
});
