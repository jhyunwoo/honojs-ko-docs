# 미들웨어 압축

이 미들웨어는 `Accept-Encoding` 요청 헤더에 따라 응답 본문을 압축합니다.

::: info
**참고**: Cloudflare Workers 및 Deno Deploy에서는 응답 본문이 자동으로 압축되므로 이 미들웨어를 사용할 필요가 없습니다.
:::

## 가져오기

```ts
import { Hono } from 'hono'
import { compress } from 'hono/compress'
```

## 사용법

```ts
const app = new Hono()

app.use(compress())
```

## 옵션

### <Badge type="info" text="optional" /> 인코딩: `'gzip'` | `'deflate'`

응답 압축을 허용하는 압축 방식입니다. `gzip` 또는 `deflate`입니다. 정의되지 않은 경우 둘 다 허용되며 `Accept-Encoding` 헤더를 기반으로 사용됩니다. 이 옵션이 제공되지 않고 클라이언트가 `Accept-Encoding` 헤더에 두 가지를 모두 제공하는 경우 `gzip`가 우선적으로 적용됩니다.

### <Badge type="info" text="optional" /> 임계값: `number`

압축할 최소 크기(바이트)입니다. 기본값은 1024바이트입니다.
