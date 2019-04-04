#!/usr/bin/env node


// 이 예제에서 다루는 로그의 특성
// 1. 특정 큐로 들어오는 로그뿐만 아니라 모든 로그 메시지를 보고자함 
//   => Rabbit에 연결할 때마다 우리는 새롭고 빈 큐가 필요함.
//      이를 위해 임의의 이름을 가진 큐를 생성 할 수 있습니다.

// 2. 이미 진행 완료 된 로그가 아닌 로그 스트림에 관심
//   => 일단 Consumer를 연결 해제하면 Queue가 자동으로 삭제됨

const amqp = require('amqplib/callback_api');
amqp.connect("amqp://localhost", (err, conn) => {
  conn.createChannel((err, ch) => {
    const ex = 'logs';

    ch.assertExchange(ex, 'fanout', {
      durable: false
    });

    // 노드에서 아래와 같이 빈 문자열로 큐 이름을 제공하면, 
    // 랜덤으로 생성된 이름을 가진 non-durable queue가 생성됨.
    ch.assertQueue('', {
      exclusive: true
    }, (err, q) => {
      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);

      // binding - change와 queue의 관계 / ch와 queue를 연결 시킴
      // $ rabbitmqctl list_bindings -> 기존의 바인딩 나열 명령어
      ch.bindQueue(q.queue, ex, '');

      ch.consume(q.queue, (msg) => {
        if (msg.content) {
          console.log(" [x] %s", msg.content.toString());
        }
      }, {
        noAck: true
      });
    });
  });
});