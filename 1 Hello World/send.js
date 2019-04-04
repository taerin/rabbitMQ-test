#!/usr/bin/env node

const amqp = require("amqplib/callback_api");
// standard port: 5672

// 1-1. 메세지 보내기
amqp.connect("amqp://localhost", (err, conn) => {
  conn.createChannel((err, ch) => {
    // named queue
    const q = "chat";
    const content = "Hello, World!!!";
    ch.assertQueue(q, {
      durable: false
    });
    ch.sendToQueue(q, Buffer.from(content));

    console.log(`Sent ${content}`);
    setTimeout(function () {
      conn.close();
      process.exit(0);
    }, 500);
  });
});