#!/usr/bin/env node

const amqp = require('amqplib/callback_api');

// 3번 예제에 메시지의 서브셋에만 구독 할 수 있도록 하는 기능 추가
amqp.connect('amqp://localhost', (err, conn) => {
  conn.createChannel((err, ch) => {
    const ex = 'direct_logs';
    const args = process.argv.slice(2);
    const msg = args.slice(1).join(' ') || 'Hello World!';
    const severity = (args.length > 0) ? args[0] : 'info';

    ch.assertExchange(ex, 'direct', {
      durable: false
    });

    ch.publish(ex, severity, Buffer.from(msg));

    console.log(" [x] Sent %s: '%s'", severity, msg);
  });

  setTimeout(() => {
    conn.close();
    process.exit(0);
  }, 500);
});