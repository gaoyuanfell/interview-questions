//  打开摄像头

const offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1,
};

let pc1;
let pc2;
let localStream;

const app = new Vue({
  el: "#app",
  data() {
    return {};
  },
  mounted() {},
  methods: {
    async media() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.$refs.localVideo.srcObject = stream;
      localStream = stream;
    },
    start() {
      this.media();
    },
    async call() {
      pc1 = new RTCPeerConnection({});
      pc2 = new RTCPeerConnection({});

      pc1.addEventListener("icecandidate", (e) => {
        pc2.addIceCandidate(e.candidate);
      });

      pc2.addEventListener("icecandidate", (e) => {
        pc1.addIceCandidate(e.candidate);
      });

      pc2.addEventListener("track", (e) => {
        if (this.$refs.remoteVideo.srcObject !== e.streams[0]) {
          this.$refs.remoteVideo.srcObject = e.streams[0];
          console.log("pc2 received remote stream");
        }
      });

      localStream.getTracks().forEach((track) => pc1.addTrack(track, localStream));

      const offer = await pc1.createOffer(offerOptions);
      console.info(offer);
      await this.onCreateOfferSuccess(offer);
    },
    async onCreateOfferSuccess(desc) {
      await pc1.setLocalDescription(desc);
      await pc2.setRemoteDescription(desc);

      const answer = await pc2.createAnswer();
      this.onCreateAnswerSuccess(answer);
    },
    async onCreateAnswerSuccess(desc) {
      await pc2.setLocalDescription(desc);
      await pc1.setRemoteDescription(desc);
    },
    hangup() {
      console.log("Ending call");
      pc1.close();
      pc2.close();
      pc1 = null;
      pc2 = null;
    },
  },
});
