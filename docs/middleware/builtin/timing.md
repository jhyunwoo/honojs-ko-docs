# 서버 타이밍 미들웨어

[Server-Timing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing) 미들웨어는 다음을 제공합니다.
응답 헤더의 성능 측정항목

::: info
참고: Cloudflare Workers에서는 타이머 측정항목이 정확하지 않을 수 있습니다.
[타이머는 마지막 I/O 시간만 표시](https://developers.cloudflare.com/workers/learning/security-model/#step-1-disallow-timers-and-multi-threading) 때문입니다.
:::

## 가져오기

```ts [npm]
import { Hono } from 'hono'
import {
  timing,
  setMetric,
  startTime,
  endTime,
  wrapTime,
} from 'hono/timing'
import type { TimingVariables } from 'hono/timing'
```

## 사용법

```js
// `c.get('metric')`를 추론할 변수 유형을 지정합니다.
type Variables = TimingVariables

const app = new Hono<{ Variables: Variables }>()

// 라우터에 미들웨어를 추가하세요
app.use(timing());

app.get('/', async (c) => {

  // 맞춤 측정항목 추가
  setMetric(c, 'region', 'europe-west3')

  // 타이밍이 포함된 맞춤 측정항목을 추가하세요. 밀리초 단위여야 합니다.
  setMetric(c, 'custom', 23.8, '내 맞춤 측정항목')

  // 새 타이머 시작해 줘
  startTime(c, 'db');
  const data = await db.findMany(...);

  // 타이머 종료해 줘
  endTime(c, 'db');

  // ...또는 다음 함수를 사용하여 Promise를 래핑할 수도 있습니다.
  const data = await wrapTime(c, 'db', db.findMany(...));

  return c.json({ response: data });
});
```

### 조건부 활성화

```ts
const app = new Hono()

app.use(
  '*',
  timing({
    // c: 요청 컨텍스트
    enabled: (c) => c.req.method === 'POST',
  })
)
```

## 결과

![](/images/timing-example.png)

## 옵션

### 총 <Badge type="info" text="optional" />: `boolean`

총 응답 시간을 표시합니다. 기본값은 `true`입니다.

### <Badge type="info" text="optional" /> 활성화됨: `boolean` | `(c: Context) => boolean`

헤더에 타이밍을 추가해야 하는지 여부입니다. 기본값은 `true`입니다.

### 총 <Badge type="info" text="optional" /> 설명: `boolean`

총 응답 시간에 대한 설명입니다. 기본값은 `Total Response Time`입니다.

### <Badge type="info" text="optional" /> 자동 종료: `boolean`

요청이 끝나면 `startTime()`가 자동으로 종료되어야 합니다.
비활성화하면 수동으로 종료되지 않은 타이머가 표시되지 않습니다.

### <Badge type="info" text="optional" /> crossOrigin: `boolean` | `string` | `(c: Context) => boolean | string`

이 타이밍 헤더의 원본을 읽을 수 있어야 합니다.

- false인 경우 현재 출처에서만 가능합니다.
- 사실이라면 모든 출처에서.
- 문자열인 경우 이 도메인의 것입니다. 여러 도메인은 쉼표로 구분해야 합니다.

기본값은 `false`입니다. 더 많은 [문서](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin)를 참조하세요.
