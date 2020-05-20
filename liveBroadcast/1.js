//  打开摄像头

const app = new Vue({
  el: "#app",
  data() {
    return {
      pc: null,
      pc2: null,
      socket: null,
    };
  },
  mounted() {
    this.socket = new WebSocket("ws://localhost:8081");
    this.pc = new RTCPeerConnection({
      sdpSemantics: "",
      // sdpSemantics: 'unified-plan',
      // sdpSemantics: 'plan-b',
    });
    this.pc2 = new RTCPeerConnection({});
  },
  methods: {
    start() {
      navigator.mediaDevices
        .getUserMedia({ audio: false, video: true })
        .then((stream) => {
          this.$refs.localVideo.srcObject = stream;
          this.localStream = stream;
          // 创建offer
          return this.pc.createOffer();
        })
        // 设置本地的offer
        .then((offer) => {
          this.pc.setLocalDescription(offer);
          this.pc2.setRemoteDescription(offer);
          this.pc2.createAnswer().then((answer) => {
            this.pc2.setLocalDescription(answer);
            this.pc.setRemoteDescription(answer);
          });
          return offer;
        });
    },

    call() {
      const videoTracks = this.localStream.getVideoTracks();
      const audioTracks = this.localStream.getAudioTracks();

      this.pc2.onaddstream = (e) => {
        this.$refs.remoteVideo.srcObject = e.stream;
      };

      this.pc.addStream(this.localStream);
    },

    local() {
      navigator.mediaDevices
        // 获取当前设备的数据
        .getUserMedia({ audio: true, video: true })
        .then((stream) => {
          this.$refs.localVideo.objectSrc = stream;
          return this.pc.addStream(stream);
        })
        // 创建offer
        .then(() => this.pc.createOffer())
        // 设置本地的offer
        .then((offer) => {
          this.pc.setLocalDescription(offer);

          return offer;
        })
        // 通过socket发送offer
        .then((offer) => {
          console.info(offer);
          this.socket.send(offer);
        })
        .catch((err) => err);
    },
    answer() {},
  },
});

// 打开摄像头，将摄像头数据给到

// 获取摄像头流数据

// 将流数据发送到服务器

// const connectButtonRef = document.querySelector("#connectButton");
// const disconnectButtonRef = document.querySelector("#disconnectButton");
// const sendButtonRef = document.querySelector("#sendButton");
// let localConnection;
// let sendChannel;

// connectButtonRef.addEventListener("click", connectPeers, false);
// disconnectButtonRef.addEventListener("click", disconnectPeers, false);
// sendButtonRef.addEventListener("click", sendMessage, false);

// function connectPeers() {
//   localConnection = new RTCPeerConnection(); // 第一步是建立该连接的 "local" 端，它是发起连接请求的一方
//   sendChannel = localConnection.createDataChannel("sendChannel"); // 下一步是通过调用RTCPeerConnection.createDataChannel() 来创建 RTCDataChannel 并设置事件侦听以监视该数据通道
//   sendChannel.onopen = handleSendChannelStatusChange;
//   sendChannel.onclose = handleSendChannelStatusChange;
// }

// function disconnectPeers() {}

// function sendMessage() {}

// function handleSendChannelStatusChange() {}
