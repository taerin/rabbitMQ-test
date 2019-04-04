#!/usr/bin/env node
const amqp = require('amqplib/callback_api');
const args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
  process.exit(1);
}

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const ex = 'direct_logs';
    ch.assertExchange(ex, 'direct', {
      durable: false
    });

    ch.assertQueue('', {
      exclusive: true
    }, (err, q) => {
      console.log(' [*] Waiting for logs. To exit press CTRL+C');

      args.forEach((severity) => {
        ch.bindQueue(q.queue, ex, severity);
      });

      ch.consume(q.queue, (msg) => {
        console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
      }, {
        noAck: true
      });
    });
  });
});