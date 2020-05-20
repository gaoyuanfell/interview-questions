const app = new Vue({
  el: "#app",
  data() {
    return {};
  },
  mounted() {
    const socket = new WebSocket("ws://localhost:8081");
    socket.addEventListener("message", () => {
      console.info("ok");
    });
  },
  methods: {},
});
