const cluster = require("cluster");
const numCPUs = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`主进程 ${process.pid} 正在运行`);
  // 衍生工作进程。
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`工作进程 ${worker.process.pid} 已退出`);
  });

  for (const id in cluster.workers) {
    cluster.workers[id].on("message", msg => {
      if (msg.event) {
        console.info(`${msg.event}:${msg.pid}`);
        // switch (event) {
        //   case "merge":
        //     console.info(msg.pid);
        //     break;
        //   case "upload":
        //     console.info(msg.pid);
        //     break;
        // }
      }
    });

    cluster.workers[id].on("online", () => {
      // 工作进程已上线。
      console.info("online");
    });
  }
} else if (cluster.isWorker) {
  require("./index");
  console.log(`工作进程 ${process.pid} 已启动`);
}
