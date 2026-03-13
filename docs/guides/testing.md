# 테스트

[비테스트]: https://vitest.dev/

테스트는 중요합니다.
실제로 Hono의 애플리케이션을 테스트하는 것은 쉽습니다.
테스트 환경을 만드는 방법은 런타임마다 다르지만 기본 단계는 동일합니다.
이번 절에서는 Cloudflare Workers와 [Vitest]로 테스트해보겠습니다.

::: tip
Cloudflare는 [@cloudflare/vitest-pool-workers](https://www.npmjs.com/package/@cloudflare/vitest-pool-workers)와 함께 [Vitest]를 사용할 것을 권장합니다. 자세한 내용은 Cloudflare Workers 문서의 [Vitest 통합](https://developers.cloudflare.com/workers/testing/vitest-integration/)을 참조하세요.
:::

## 요청과 응답

여러분이 해야 할 일은 요청을 생성하고 이를 Hono 애플리케이션에 전달하여 응답의 유효성을 검사하는 것뿐입니다.
그리고 유용한 방법인 `app.request`를 사용할 수 있습니다.

::: tip
형식화된 테스트 클라이언트에 대해서는 [테스트 도우미](/docs/helpers/testing)를 참조하세요.
:::

예를 들어, 다음 REST API를 제공하는 애플리케이션을 생각해 보세요.

```ts
app.get('/posts', (c) => {
  return c.text('많은 게시물')
})

app.post('/posts', (c) => {
  return c.json(
    {
      message: '생성됨',
    },
    201,
    {
      'X-Custom': '감사합니다',
    }
  )
})
```

`GET /posts`에 요청하고 응답을 테스트합니다.

```ts
describe('Example', () => {
  test('GET /posts', async () => {
    const res = await app.request('/posts')
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('많은 게시물')
  })
})
```

`POST /posts`에 요청하려면 다음을 수행하세요.

```ts
test('POST /posts', async () => {
  const res = await app.request('/posts', {
    method: 'POST',
  })
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('감사합니다')
  expect(await res.json()).toEqual({
    message: '생성됨',
  })
})
```

`JSON` 데이터로 `POST /posts`에 요청하려면 다음을 수행합니다.

```ts
test('POST /posts', async () => {
  const res = await app.request('/posts', {
    method: 'POST',
    body: JSON.stringify({ message: '안녕 호노' }),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  })
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('감사합니다')
  expect(await res.json()).toEqual({
    message: '생성됨',
  })
})
```

`multipart/form-data` 데이터로 `POST /posts`에 요청하려면 다음을 수행합니다.

```ts
test('POST /posts', async () => {
  const formData = new FormData()
  formData.append('message', 'hello')
  const res = await app.request('/posts', {
    method: 'POST',
    body: formData,
  })
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('감사합니다')
  expect(await res.json()).toEqual({
    message: '생성됨',
  })
})
```

Request 클래스의 인스턴스를 전달할 수도 있습니다.

```ts
test('POST /posts', async () => {
  const req = new Request('http://localhost/posts', {
    method: 'POST',
  })
  const res = await app.request(req)
  expect(res.status).toBe(201)
  expect(res.headers.get('X-Custom')).toBe('감사합니다')
  expect(await res.json()).toEqual({
    message: '생성됨',
  })
})
```

이런 식으로 End-to-End처럼 테스트할 수 있습니다.

## 환경

테스트를 위해 `c.env`를 설정하려면 이를 `app.request`의 3번째 매개변수로 전달하면 됩니다. 이는 [Cloudflare Workers 바인딩](https://hono.dev/getting-started/cloudflare-workers#bindings)과 같은 값을 모의하는 데 유용합니다.

```ts
const MOCK_ENV = {
  API_HOST: 'example.com',
  DB: {
    prepare: () => {
      /* mocked D1 */
    },
  },
}

test('GET /posts', async () => {
  const res = await app.request('/posts', {}, MOCK_ENV)
})
```
