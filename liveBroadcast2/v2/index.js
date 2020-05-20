const socket = new WebSocket("wss://192.168.125.6:8081");

function send(message) {
  socket.send(JSON.stringify(message));
}

new Vue({
  el: "#app",
  data() {
    return {
      roomId: 123456789,
    };
  },
  mounted() {
    socket.addEventListener("message", async ({ data }) => {
      let message = JSON.parse(data);
    });
  },
  methods: {
    roomIn() {
      send({
        type: "roomIn",
        data: {
          id: this.roomId,
        },
      });
    },
  },
});
