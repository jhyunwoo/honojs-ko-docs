# 경로 도우미

Route Helper는 디버깅 및 미들웨어 개발을 위한 향상된 라우팅 정보를 제공합니다. 일치하는 경로와 현재 처리 중인 경로에 대한 자세한 정보에 액세스할 수 있습니다.

## 가져오기

```ts
import { Hono } from 'hono'
import {
  matchedRoutes,
  routePath,
  baseRoutePath,
  basePath,
} from 'hono/route'
```

## 사용법

### 기본 경로 정보

```ts
const app = new Hono()

app.get('/posts/:id', (c) => {
  const currentPath = routePath(c) // '/posts/:id'
  const routes = matchedRoutes(c) // Array of matched routes

  return c.json({
    path: currentPath,
    totalRoutes: routes.length,
  })
})
```

### 하위 애플리케이션 작업

```ts
const app = new Hono()
const apiApp = new Hono()

apiApp.get('/posts/:id', (c) => {
  return c.json({
    routePath: routePath(c), // '/posts/:id'
    baseRoutePath: baseRoutePath(c), // '/api'
    basePath: basePath(c), // '/api' (with actual params)
  })
})

app.route('/api', apiApp)
```

## `matchedRoutes()`

미들웨어를 포함하여 현재 요청과 일치하는 모든 경로의 배열을 반환합니다.

```ts
app.all('/api/*', (c, 다음) => {
  console.log('API 미들웨어')
  return next()
})

app.get('/api/users/:id', (c) => {
  const routes = matchedRoutes(c)
  // 반환: [
  //   { method: 'ALL', path: '/api/*', handler: [Function] },
  //   { method: 'GET', path: '/api/users/:id', handler: [Function] }
  // ]
  return c.json({ routes: routes.length })
})
```

## `routePath()`

현재 핸들러에 등록된 경로 경로 패턴을 반환합니다.

```ts
app.get('/posts/:id', (c) => {
  console.log(routePath(c)) // '/posts/:id'
  return c.text('게시물 세부정보')
})
```

### 인덱스 매개변수와 함께 사용

선택적으로 인덱스 매개변수를 전달하여 `Array.prototype.at()`와 유사하게 특정 위치의 경로 경로를 가져올 수 있습니다.

```ts
app.all('/api/*', (c, 다음) => {
  return next()
})

app.get('/api/users/:id', (c) => {
  console.log(routePath(c, 0)) // '/api/*' (첫 번째로 일치하는 경로)
  console.log(routePath(c, -1)) // '/api/users/:id' (마지막으로 일치하는 경로)
  return c.text('사용자 세부정보')
})
```

## `baseRoutePath()`

라우팅에 지정된 대로 현재 경로의 기본 경로 패턴을 반환합니다.

```ts
const subApp = new Hono()
subApp.get('/posts/:id', (c) => {
  return c.text(baseRoutePath(c)) // '/:sub'
})

app.route('/:sub', subApp)
```

### 인덱스 매개변수와 함께 사용

선택적으로 인덱스 매개변수를 전달하여 특정 위치에서 기본 경로 경로를 가져올 수 있습니다.
위치는 `Array.prototype.at()`와 유사합니다.

```ts
app.all('/api/*', (c, 다음) => {
  return next()
})

const subApp = new Hono()
subApp.get('/users/:id', (c) => {
  console.log(baseRoutePath(c, 0)) // '/' (첫 번째로 일치하는 경로)
  console.log(baseRoutePath(c, -1)) // '/api' (마지막으로 일치하는 경로)
  return c.text('사용자 세부정보')
})

app.route('/api', subApp)
```

## `basePath()`

실제 요청에서 매개변수가 포함된 기본 경로를 반환합니다.

```ts
const subApp = new Hono()
subApp.get('/posts/:id', (c) => {
  return c.text(basePath(c)) // '/api' (for request to '/api/posts/123')
})

app.route('/:sub', subApp)
```
