# Pretty JSON 미들웨어

Pretty JSON 미들웨어는 JSON 응답 본문에 대해 "사람이 읽기 쉬운 포맷팅"을 활성화합니다.
URL 쿼리 매개변수에 `?pretty`를 추가하면 JSON 문자열이 보기 좋게 출력됩니다.

```js
// GET /
{"project":{"name":"Hono","repository":"https://github.com/honojs/hono"}}
```

다음과 같이 바뀝니다.

```js
// GET /?pretty
{
  "project": {
    "name": "Hono",
    "repository": "https://github.com/honojs/hono"
  }
}
```

## 가져오기

```ts
import { Hono } from 'hono'
import { prettyJSON } from 'hono/pretty-json'
```

## 사용법

```ts
const app = new Hono()

app.use(prettyJSON()) // With options: prettyJSON({ space: 4 })
app.get('/', (c) => {
  return c.json({ message: 'Hono!' })
})
```

## 옵션

### <Badge type="info" text="optional" /> space: `number`

들여쓰기를 위한 공백 수입니다. 기본값은 `2`입니다.

### <Badge type="info" text="optional" /> query: `string`

적용할 쿼리 문자열의 이름입니다. 기본값은 `pretty`입니다.

### <Badge type="info" text="optional" /> force: `boolean`

`true`로 설정하면 JSON 응답은 쿼리 매개변수에 관계없이 항상 구체화됩니다. 기본값은 `false`입니다.
