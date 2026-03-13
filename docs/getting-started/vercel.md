# Vercel

Vercel는 더 빠르고 개인화된 웹을 구축, 확장 및 보호할 수 있는 개발자 도구와 클라우드 인프라를 제공하는 AI 클라우드입니다.

Hono는 구성이 필요 없는 Vercel에 배포될 수 있습니다.

## 1. 설정

Vercel용 스타터를 사용할 수 있습니다.
"create-hono" 명령으로 프로젝트를 시작하세요.
이 예에서는 `vercel` 템플릿을 선택합니다.

::: code-group

```sh [npm]
npm create hono@latest my-app
```

```sh [yarn]
yarn create hono my-app
```

```sh [pnpm]
pnpm create hono my-app
```

```sh [bun]
bun create hono@latest my-app
```

```sh [deno]
deno init --npm hono my-app
```

:::

`my-app`로 이동하고 종속성을 설치합니다.

::: code-group

```sh [npm]
cd my-app
npm i
```

```sh [yarn]
cd my-app
yarn
```

```sh [pnpm]
cd my-app
pnpm i
```

```sh [bun]
cd my-app
bun i
```

:::

다음 단계에서는 Vercel CLI를 사용하여 로컬로 앱 작업을 수행하겠습니다. 아직 설치하지 않았다면 [Vercel CLI 문서](https://vercel.com/docs/cli)에 따라 전역적으로 설치하세요.

## 2. 헬로 월드

프로젝트의 `index.ts` 또는 `src/index.ts`에서 Hono 애플리케이션을 기본 내보내기로 내보냅니다.

```ts
import { Hono } from 'hono'

const app = new Hono()

const welcomeStrings = [
  '안녕하세요 Hono!',
  'To learn more about Hono on Vercel, visit https://vercel.com/docs/frameworks/backend/hono',
]

app.get('/', (c) => {
  return c.text(welcomeStrings.join('\n\n'))
})

export default app
```

`vercel` 템플릿으로 시작한 경우 이는 이미 설정되어 있습니다.

## 3. 실행

개발 서버를 로컬로 실행하려면 다음 안내를 따르세요.

```sh
vercel dev
```

`localhost:3000`를 방문하면 문자 응답으로 응답합니다.

## 4. 배포

`vc deploy`를 사용하여 Vercel에 배포합니다.

```sh
vercel deploy
```

## 추가 읽기

[Vercel 문서에서 Hono에 대해 자세히 알아보세요](https://vercel.com/docs/frameworks/backend/hono).
