#!/usr/bin/env node

const amqp = require("amqplib/callback_api");

// 모든 RPC 요청마다 콜백을 받을 수 있는 콜백 Queue를 생성하는 것이 좋다
// 하지만 이는 비효율적이니 클라이언트 당 하나의 콜백 Queue를 생성

//  * 예제에서 제시된 RCP 작동방식
//  1. 클라이언트가 시작되면 익명의 전용 콜백 큐가 생성
//  2. RPC 요청의 경우 클라이언트는 콜백 큐에 설정된 reply_to와 모든 요청의 고유한 ID 인
//     correlation_id의 두 가지 특성을 가진 메시지를 보냅니다.
//  3. 요청은 rpc_queue 라는 이름의 Queue로 보내집니다.
//  4. RPC 작업자(서버)는 해당 큐에 대한 요청을 기다리고 있습니다. 요청이 나타나면 작업을 수행하고 
//     reply_to 필드의 큐를 사용하여 결과가 포함 된 메시지를 클라이언트에 보냅니다 .
//  5. 클라이언트는 콜백 큐에있는 데이터를 기다립니다. 메시지가 나타나면 correlation_id 등록 정보를 확인합니다. 
//     요청의 값과 일치하면 응용 프로그램에 응답을 반환합니다.

amqp.connect("amqp://localhost", (err, conn) => {
  conn.createChannel((err, ch) => {
    const q = "rpc_queue";

    ch.assertQueue(q, {
      durable: false
    });

    // * prefetch: RabbitMQ에게 한 번에 하나 이상의 메시지를 제공하지 말 것.
    // * 여러 서버에 균등하게 부하를 분산하려면 채널에 prefetch를 설정해야 함.*
    ch.prefetch(1);
    console.log(" [x] Awaiting RPC requests");

    ch.consume(q, (msg) => {
      const n = parseInt(msg.content.toString());
      console.log(" [.] fib(%d)", n);

      const r = fibonacci(n);

      // - Queue에 메시지를 보낼때의 메시지의 속성 (ch.sendToQueue의 마지막 매개변수)
      //   * persistent: 메시지를 영구적(true)이거나 또는 일시적(false)으로 표시
      //   * content_type: 인코딩의 MIME 유형을 설명 / JSON일때, application / json
      //   * reply_to: 일반적으로 콜백의 Queue의 이름을 지정하는데 사용
      //   * corerelation_id: RPC 응답을 요청과 연관시키는데 유용 / 모든 요청 마다 고유한 값을 가짐.
      //                      새로운 큐가 생겨 응답을 받았는지 여부가 확실하지 않을때 사용. 
      //                      나중에 콜백 대기열에서 메시지를 받으면이 속성을 살펴보고 응답을 기반으로 응답을 요청과 일치시킬 수 있음. 
      //                      알 수 없는 correlation_id 값이 표시되면 메시지를 안전하게 삭제할 수 있다.

      // ch.sendToQueue(처리한 값을 보낼 Queue, 내용, {요청 id}) 
      ch.sendToQueue(msg.properties.replyTo, Buffer.from(r.toString()), {
        correlationId: msg.properties.correlationId
      });

      ch.ack(msg);
    });
  });
});

function fibonacci(n) {
  if (n == 0 || n == 1)
    return n;
  else
    return fibonacci(n - 1) + fibonacci(n - 2);
}