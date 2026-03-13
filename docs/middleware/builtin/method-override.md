# 메서드 재정의 미들웨어

폼, 헤더, 쿼리의 값에 따라 요청의 실제 메소드와 다른 지정된 메소드의 핸들러를 실행하고 그에 대한 응답을 반환하는 미들웨어입니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { methodOverride } from 'hono/method-override'
```

## 사용법

```ts
const app = new Hono()

// 옵션이 지정되지 않은 경우 `_method` 형식의 값은 다음과 같습니다.
// 예를 들어 DELETE가 메소드로 사용됩니다.
app.use('/posts', methodOverride({ app }))

app.delete('/posts', (c) => {
  // ....
})
```

## 예를 들어

HTML 양식은 DELETE 메소드를 보낼 수 없으므로 `_method`라는 속성에 `DELETE` 값을 넣어서 보낼 수 있습니다. 그리고 `app.delete()`에 대한 핸들러가 실행됩니다.

HTML 형식:

```html
<form action="/posts" method="POST">
  <input type="hidden" name="_method" value="DELETE" />
  <input type="text" name="id" />
</form>
```

응용 프로그램:

```ts
import { methodOverride } from 'hono/method-override'

const app = new Hono()
app.use('/posts', methodOverride({ app }))

app.delete('/posts', () => {
  // ...
})
```

기본값을 변경하거나 헤더 값과 쿼리 값을 사용할 수 있습니다.

```ts
app.use('/posts', methodOverride({ app, form: '_custom_name' }))
app.use(
  '/posts',
  methodOverride({ app, header: 'X-METHOD-OVERRIDE' })
)
app.use('/posts', methodOverride({ app, query: '_method' }))
```

## 옵션

### <Badge type="danger" text="required" /> 앱: `Hono`

`Hono` 인스턴스가 애플리케이션에 사용됩니다.

### <Badge type="info" text="optional" /> 형식: `string`

메소드 이름이 포함된 값이 있는 양식 키입니다.
기본값은 `_method`입니다.

### <Badge type="info" text="optional" /> 헤더: `boolean`

메소드 이름을 포함하는 값이 있는 헤더 이름입니다.

### <Badge type="info" text="optional" /> 쿼리: `boolean`

메서드 이름이 포함된 값이 포함된 쿼리 매개변수 키입니다.
