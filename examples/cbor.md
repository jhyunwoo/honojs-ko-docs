# CBOR

[CBOR](https://cbor.io/)는 [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949.html)에 정의된 개체를 직렬화하기 위한 바이너리 형식입니다. JSON와 호환되며 효율적인 데이터 교환이 필요한 네트워크 통신은 물론 IoT 장치와 같이 리소스가 제한된 환경에서도 사용하기에 적합합니다.

다음은 [cbor2](https://www.npmjs.com/package/cbor2) 패키지를 사용하여 CBOR로 응답하는 예입니다.

```ts
import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import { encode } from 'cbor2'

const app = new Hono()

declare module 'hono' {
  interface ContextRenderer {
    (content: any): Response | Promise<Response>
  }
}

const cborRenderer = createMiddleware(async (c, next) => {
  c.header('Content-Type', 'application/cbor')
  c.setRenderer((content) => {
    return c.body(encode(content))
  })
  await next()
})

app.use(cborRenderer)

app.get('/', (c) => {
  return c.render({ message: '안녕하세요 CBOR!' })
})

export default app
```

다음 명령을 사용하여 응답을 확인할 수 있습니다.

```plaintext
$ curl -s http://localhost:3000/ | hexdump -C
00000000  a1 67 6d 65 73 73 61 67  65 6b 68 65 6c 6c 6f 20  |.gmessagekhello |
00000010  43 42 4f 52 21                                    |CBOR!|
00000015
```

또한 [CBOR 플레이그라운드](https://cbor.me/)에서 JSON 개체로 디코딩되는지 확인할 수 있습니다.

```plaintext
A1                           # map(1)
   67                        # text(7)
      6D657373616765         # "message"
   6B                        # text(11)
      68656C6C6F2043424F5221 # "hello CBOR!"
```

```json
{ "message": "hello CBOR!" }
```

## 또한보십시오

- [CBOR — 간결한 이진 객체 표현 | 개요](https://cbor.io/)
- [CBOR 놀이터](https://cbor.me/)
