const ports = [];
onconnect = e => {
  console.info(e);
  const port = e.ports[0];
  ports.push(port);
  port.onmessage = evt => {
    ports
      .filter(v => v !== port) // 此处为了贴近其他方案的实现，剔除自己
      .forEach(p => p.postMessage(evt.data));
  };
};
