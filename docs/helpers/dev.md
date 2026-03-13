# 개발 도우미

Dev Helper는 개발에 사용할 수 있는 유용한 방법을 제공합니다.

```ts
import { Hono } from 'hono'
import { getRouterName, showRoutes } from 'hono/dev'
```

## `getRouterName()`

`getRouterName()`를 사용하면 현재 사용되는 라우터의 이름을 얻을 수 있습니다.

```ts
const app = new Hono()

// ...

console.log(getRouterName(app))
```

## `showRoutes()`

`showRoutes()` 함수는 콘솔에 등록된 경로를 표시합니다.

다음과 같은 애플리케이션을 고려해보세요.

```ts
const app = new Hono().basePath('/v1')

app.get('/posts', (c) => {
  // ...
})

app.get('/posts/:id', (c) => {
  // ...
})

app.post('/posts', (c) => {
  // ...
})

showRoutes(app, {
  verbose: true,
})
```

이 애플리케이션이 실행되기 시작하면 콘솔에 경로가 다음과 같이 표시됩니다.

```txt
GET   /v1/posts
GET   /v1/posts/:id
POST  /v1/posts
```

## 옵션

### <Badge type="info" text="optional" /> 자세한 설명: `boolean`

`true`로 설정하면 자세한 정보가 표시됩니다.

### <Badge type="info" text="optional" /> 색상화: `boolean`

`false`로 설정하면 출력에 색상이 지정되지 않습니다.
