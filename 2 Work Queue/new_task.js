#!/usr/bin/env node
const amqp = require("amqplib/callback_api");

// 2. 여러 worker에게 시간 소모적인 작업을 분배하는 데 사용할 수 있는 Work Queue을 만들 것
amqp.connect("amqp://localhost", (err, conn) => {
  conn.createChannel((err, ch) => {
    const q = "task_queue";
    const msg = process.argv.slice(2).join(" ") || "Hello world";

    ch.assertQueue(q, {
      durable: true
    });

    ch.sendToQueue(q, Buffer.from(msg), {
      persistent: true
    });

    console.log("[x] Sent '%s'", msg);
  });
});