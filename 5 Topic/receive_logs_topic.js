#!/usr/bin/env node

// 'topic' change에서는 'direct'와 같이 임의의 routing_key를 사용할 수 없음.
// routing_key는 점으로 구분 된 단어여야 하며, 255바이트 이내 여야함.
//  - * (star) : 정확하게 한 단어 대체
//  - # (hash) : 0 또는 0개 이상의 단어 대체

const amqp = require('amqplib/callback_api');
const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: receive_logs_topic.js <facility>.<severity>");
  process.exit(1);
}

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const ex = 'topic_logs';

    ch.assertExchange(ex, 'topic', {durable: false});

    ch.assertQueue('', {exclusive: true}, (err, q) => {
      console.log(' [*] Waiting for logs. To exit press CTRL+C');

      args.forEach((key) => {
        ch.bindQueue(q.queue, ex, key);
      });

      ch.consume(q.queue, (msg) => {
        console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
      }, {noAck: true});
    });
  });
});

