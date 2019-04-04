#!/usr/bin/env node
const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function (err, conn) {
  conn.createChannel(function (err, ch) {
    var ex = 'logs';
    var msg = process.argv.slice(2).join(' ') || 'Hello World!';

    // fanout 교환 타입
    ch.assertExchange(ex, 'fanout', {
      durable: false
    });

    // 두 번째 매개 변수로 빈 문자열은 특정한 큐에 메시지를 보내지 않는다는 뜻
    // 대신 'log' exchange에 게시하기를 원함
    ch.publish(ex, '', Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });

  setTimeout(function () {
    conn.close();
    process.exit(0);
  }, 500);
});