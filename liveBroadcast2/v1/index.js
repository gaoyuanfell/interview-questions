//  打开摄像头

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

const config = { video: true, audio: false };

let pc;
let stream;
let socket;

function send(message) {
  socket.send(JSON.stringify(message));
}

const app = new Vue({
  el: "#app",
  data() {
    return {
      roomId: 123456789,
      remoteList: [],
    };
  },
  created() {
    socket = new WebSocket("wss://192.168.125.6:8081"); // https://ae75da08.ngrok.io
    // socket = new WebSocket("wss://e55c36f5.ngrok.io"); // https://ae75da08.ngrok.io
  },
  mounted() {
    socket.addEventListener("message", async ({ data }) => {
      let message = JSON.parse(data);
      switch (message.type) {
        case "userMedia":
          console.info("1");
          pc = new RTCPeerConnection(null);

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              send({
                type: "candidate",
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate,
              });
            }
          };

          pc.onaddstream = (event) => {
            console.info("remoteVideo");
            // this.$refs.remoteVideo.srcObject = event.stream;
            this.remoteList.push(event.stream);

            let video = document.createElement("video");
            video.autoplay = true;
            video.srcObject = event.stream;

            this.$refs.videoBox.appendChild(video);
          };

          stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream);
          });

          //
          let offer = await pc.createOffer();
          pc.setLocalDescription(offer);
          //
          send(offer);
          break;
        case "offer":
          console.info("2");

          pc.setRemoteDescription(new RTCSessionDescription(message));

          //
          let answer = await pc.createAnswer({
            mandatory: {
              OfferToReceiveAudio: true,
              OfferToReceiveVideo: true,
            },
          });
          pc.setLocalDescription(answer);
          send(answer);
          break;
        case "answer":
          console.info("3");
          pc.setRemoteDescription(new RTCSessionDescription(message));
          break;
        case "candidate":
          console.info("4");
          const candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate,
          });
          pc.addIceCandidate(candidate);
          break;
      }
    });
    this.media();
  },
  methods: {
    async media() {
      stream = await navigator.mediaDevices.getUserMedia(config);
      this.$refs.localVideo.srcObject = stream;
      send({
        type: "userMedia",
      });
    },
  },
});
