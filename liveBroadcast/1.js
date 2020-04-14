//  打开摄像头

const videoRef = document.querySelector("#video");
const connectButtonRef = document.querySelector("#connectButton");
const disconnectButtonRef = document.querySelector("#disconnectButton");
const sendButtonRef = document.querySelector("#sendButton");
let localConnection;
let sendChannel;

connectButtonRef.addEventListener("click", connectPeers, false);
disconnectButtonRef.addEventListener("click", disconnectPeers, false);
sendButtonRef.addEventListener("click", sendMessage, false);

function connectPeers() {
  localConnection = new RTCPeerConnection(); // 第一步是建立该连接的 "local" 端，它是发起连接请求的一方
  sendChannel = localConnection.createDataChannel("sendChannel"); // 下一步是通过调用RTCPeerConnection.createDataChannel() 来创建 RTCDataChannel 并设置事件侦听以监视该数据通道
  sendChannel.onopen = handleSendChannelStatusChange;
  sendChannel.onclose = handleSendChannelStatusChange;
}

function disconnectPeers() {}

function sendMessage() {}

function handleSendChannelStatusChange() {
  console.info("ok");
}

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then((stream) => {
    videoRef.srcObject = stream;
    videoRef.play();
  })
  .catch((err) => {
    console.log("An error occured! " + err);
  });

// 获取摄像头流数据

// 将流数据发送到服务器
