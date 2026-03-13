# Remix

[Remix](https://remix.run/)는 웹 표준 기반 풀스택 프레임워크입니다.

이제 Remix 및 Hono를 API 가져오기를 통해 함께 사용할 수 있습니다.

## Remix + Hono

다음과 같이 [Remix + Hono](https://github.com/sergiodxa/remix-hono)를 사용하여 Remix를 Hono 미들웨어로 사용할 수 있습니다.

```ts
import * as build from '@remix-run/dev/server-build'
import { remix } from 'remix-hono/handler'

app.use('*', remix({ build, mode: process.env.NODE_ENV }))
```

## 또한보십시오

- [Remix](https://remix.run/)
- [Remix Hono](https://github.com/sergiodxa/remix-hono)
