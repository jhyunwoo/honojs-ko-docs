# 파일 업로드

콘텐츠 유형이 `multipart/form-data`인 파일을 업로드할 수 있습니다. 업로드된 파일은 `c.req.parseBody()`에서 보실 수 있습니다.

```ts
const app = new Hono()

app.post('/upload', async (c) => {
  const body = await c.req.parseBody()
  console.log(body['file']) // File | string
})
```

## 또한보십시오

- [API - HonoRequest - 구문 분석 바디](/docs/api/request#parsebody)
