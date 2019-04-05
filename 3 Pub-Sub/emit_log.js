#!/usr/bin/env node
const amqp = require('amqplib/callback_api');

// 많은 수신자에게 로그 메시지를 브로드 캐스팅하기 위한 예제 
amqp.connect('amqp://localhost',  (err, conn) => {
  conn.createChannel( (err, ch) => {
    var ex = 'logs';
    var msg = process.argv.slice(2).join(' ') || 'Hello World!';

    // fanout 타입의 교환
    ch.assertExchange(ex, 'fanout', {
      durable: false
    });

    // 두 번째 매개 변수로 빈 문자열은 특정한 큐에 메시지를 보내지 않는다는 뜻
    // 대신 'log' exchange(큐로 보내는 역할을 하는 교환기)에 게시하기를 원함
    ch.publish(ex, '', Buffer.from(msg));
    console.log(" [x] Sent %s", msg);
  });

  setTimeout( () => {
    conn.close();
    process.exit(0);
  }, 500);
});