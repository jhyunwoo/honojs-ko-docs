# 캐시 미들웨어

캐시 미들웨어는 웹 표준의 [Cache API](https://developer.mozilla.org/en-US/docs/Web/API/Cache)를 사용합니다.

캐시 미들웨어는 현재 사용자 정의 도메인을 사용하는 Cloudflare Workers 프로젝트와 [Deno 1.26+](https://github.com/denoland/deno/releases/tag/v1.26.0)를 사용하는 Deno 프로젝트를 지원합니다. Deno Deploy와 함께 사용할 수도 있습니다.

Cloudflare Workers는 `Cache-Control` 헤더를 존중하고 캐시된 응답을 반환합니다. 자세한 내용은 [Cloudflare 문서에 캐시](https://developers.cloudflare.com/workers/runtime-apis/cache/)를 참조하세요. Deno는 헤더를 존중하지 않으므로 캐시를 업데이트해야 하는 경우 고유한 메커니즘을 구현해야 합니다.

각 플랫폼에 대한 지침은 아래 [사용법](#usage)을 참조하세요.

## 가져오기

```ts
import { Hono } from 'hono'
import { cache } from 'hono/cache'
```

## 사용법

::: code-group

```ts [Cloudflare Workers]
app.get(
  '*',
  cache({
    cacheName: 'my-app',
    cacheControl: 'max-age=3600',
  })
)
```

```ts [Deno]
// Deno 런타임에는 `wait: true`를 사용해야 합니다.
app.get(
  '*',
  cache({
    cacheName: 'my-app',
    cacheControl: 'max-age=3600',
    wait: true,
  })
)
```

:::

## 옵션

### <Badge type="danger" text="required" /> 캐시 이름: `string` | `(c: Context) => string` | `Promise<string>`

캐시의 이름입니다. 서로 다른 식별자를 사용하여 여러 캐시를 저장하는 데 사용할 수 있습니다.

### <Badge type="info" text="optional" /> 대기: `boolean`

Hono가 요청을 계속하기 전에 `cache.put` 함수의 약속이 해결될 때까지 기다려야 하는지 여부를 나타내는 부울입니다. _Deno 환경에서는 true여야 합니다_. 기본값은 `false`입니다.

### <Badge type="info" text="optional" /> 캐시 제어: `string`

`Cache-Control` 헤더에 대한 지시문 문자열입니다. 자세한 내용은 [MDN 문서](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)를 참조하세요. 이 옵션이 제공되지 않으면 `Cache-Control` 헤더가 요청에 추가되지 않습니다.

### <Badge type="info" text="optional" /> 다양함: `string` | `string[]`

응답에 `Vary` 헤더를 설정합니다. 원래 응답 헤더에 이미 `Vary` 헤더가 포함되어 있는 경우 값이 병합되어 중복 항목이 제거됩니다. `*`로 설정하면 오류가 발생합니다. Vary 헤더와 캐싱 전략에 대한 영향에 대한 자세한 내용은 [MDN 문서](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary)를 참조하세요.

### <Badge type="info" text="optional" /> 키 생성기: `(c: Context) => string | Promise<string>`

`cacheName` 저장소의 모든 요청에 ​​대한 키를 생성합니다. 이는 요청 매개변수 또는 컨텍스트 매개변수를 기반으로 데이터를 캐시하는 데 사용될 수 있습니다. 기본값은 `c.req.url`입니다.

### <Badge type="info" text="optional" /> 캐시 가능상태 코드: `number[]`

캐시되어야 하는 상태 코드의 배열입니다. 기본값은 `[200]`입니다. 특정 상태 코드가 포함된 응답을 캐시하려면 이 옵션을 사용하세요.

```ts
app.get(
  '*',
  cache({
    cacheName: 'my-app',
    cacheControl: 'max-age=3600',
    cacheableStatusCodes: [200, 404, 412],
  })
)
```
