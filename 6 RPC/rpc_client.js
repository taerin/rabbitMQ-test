#!/usr/bin/env node

const amqp = require("amqplib/callback_api");
const args = process.argv.slice(2)

if (args.length === 0) {
  console.log("입력 형태: rpc_client.js {num}");
  process.exit();
}

amqp.connect("amqp://localhost", (err, conn) => {
  conn.createChannel((err, ch) => {
    // 이름을 지정하지 않은 형태의 queue
    ch.assertQueue("", {
      exclusive: true
    }, (err, q) => {
      const corr = generateUuid();
      const num = parseInt(args[0]);

      console.log(" [x] Requesting fib(%d)", num);

      ch.sendToQueue("rpc_queue", Buffer.from(num.toString()), {
        replyTo: q.queue,
        correlationId: corr,
      });

      // 대기
      ch.consume(q.queue, (msg) => {
        if (msg.properties.correlationId === corr) {
          console.log(" [.] Got %s", msg.content.toString());
          setTimeout(() => {
            conn.close();
            process.exit(0);
          }, 500);
        }
      }, {
        noAck: true
      });      
    });
  });
});

function generateUuid() {
  return Math.random().toString() +
    Math.random().toString() +
    Math.random().toString();
}