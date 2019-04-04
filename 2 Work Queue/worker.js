#!/usr/bin/env node

const amqp = require("amqplib/callback_api");

// 1-2. 메세지 받기
// 리소스 집약적인 작업을 즉시 수행하지 않음으로서 작업이 완료될 때까지 기다려야 하는 것을 피하기.
// 대신에 우리는 그 일을 나중에 하기로 일정을 잡는다. 
// 우리는 하나의 과제를 메시지로 캡슐화하여 대기열로 보낸다.
amqp.connect("amqp://localhost", (err, conn) => {
  conn.createChannel((err, ch) => {
    const q = "task_queue";
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q);

    ch.assertQueue(q, {
      durable: true
    });
    // prefetch: RabbitMQ에게 한 번에 하나 이상의 메시지를 제공하지 말 것을 알려줍니다.
    // 즉, 이전 메시지를 처리하고 확인하기 전까지는 새 메시지를 작업자에게 보내지 마십시오.
    ch.prefetch(1);
    ch.consume(q, msg => {
      const secs = msg.content.toString().split(".").length - 1;
      console.log(" [x] Received %s", msg.content.toString());

      // 바쁜 작업인 척하기
      setTimeout(() => {
        console.log("[x] Done");
        ch.ack(msg);
      }, secs * 1000);
    }, {
      noAck: false,
      // ack(nowledgement)는 특정 메시지가 수신되고 처리되었으며 
      // RabbitMQ가 메시지를 삭제할 수 있다고 RabbitMQ에게 알리기 위해 소비자가 보낸 답
    });
  });
});