#!/usr/bin/env node
const amqp = require('amqplib/callback_api');

// $ ./emit_log_topic.js "kern.light" "Taerin has the critial issue"

amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const ex = 'topic_logs';
    const args = process.argv.slice(2);
    const key = (args.length > 0) ? args[0] : 'anonymous.info';
    const msg = args.slice(1).join(' ') || 'Hello World!';

    ch.assertExchange(ex, 'topic', {
      durable: false
    });

    ch.publish(ex, key, Buffer.from(msg));
    console.log(" [x] Sent %s:'%s'", key, msg);
  });

  setTimeout(() => {
    conn.close();
    process.exit(0);
  }, 500);
});