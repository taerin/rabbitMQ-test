#!/usr/bin/env node
// Producer: A user application that sends messages.
// Queue: A buffer that stores messages.
// Consumer: A user application that receives messages.

const amqp = require("amqplib/callback_api");

// 1-2. 메세지 받기
amqp.connect("amqp://localhost", (err, conn) => {
  conn.createChannel((err, ch) => {
    const queue = "chat";
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    ch.consume(queue, (msg) => {
      console.log(" [x] Received %s", msg.content.toString());
    }, {
      noAck: true
    });
  });
});