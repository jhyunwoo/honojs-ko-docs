# Supabase Edge 함수

[Supabase](https://supabase.com/)는 Firebase의 오픈소스 대안으로, 데이터베이스, 인증, 저장소는 물론 서버리스 기능까지 포함하여 Firebase의 기능과 유사한 도구 모음을 제공합니다.

Supabase Edge Functions는 전 세계적으로 배포되는 서버 측 TypeScript 함수로, 성능 향상을 위해 사용자에게 더 가까이 다가갑니다. 이러한 기능은 [Deno](https://deno.com/)를 사용하여 개발되었으며, 이는 향상된 보안 및 최신 JavaScript/TypeScript 런타임을 포함하여 여러 가지 이점을 제공합니다.

Supabase Edge Functions를 시작하는 방법은 다음과 같습니다.

## 1. 설정

### 전제조건

시작하기 전에 Supabase CLI가 설치되어 있는지 확인하세요. 아직 설치하지 않았다면 [공식 문서](https://supabase.com/docs/guides/cli/getting-started)의 지침을 따르세요.

### 새 프로젝트 만들기

1. 터미널이나 명령 프롬프트를 엽니다.

2. 다음을 실행하여 로컬 컴퓨터의 디렉터리에 새 Supabase 프로젝트를 만듭니다.

```bash
supabase init

```

이 명령은 현재 디렉터리에서 새 Supabase 프로젝트를 초기화합니다.

### Edge 기능 추가

3. Supabase 프로젝트 내에서 `hello-world`라는 새 Edge 함수를 만듭니다.

```bash
supabase functions new hello-world

```

이 명령은 프로젝트에 지정된 이름을 가진 새 Edge Function을 생성합니다.

## 2. 헬로 월드

`supabase/functions/hello-world/index.ts` 파일을 수정하여 `hello-world` 함수를 편집합니다.

```ts
import { Hono } from 'jsr:@hono/hono'

// 이것을 함수 이름으로 변경하십시오
const functionName = 'hello-world'
const app = new Hono().basePath(`/${functionName}`)

app.get('/hello', (c) => c.text('Hello from hono-server!'))

Deno.serve(app.fetch)
```

## 3. 실행

함수를 로컬로 실행하려면 다음 명령을 사용하십시오.

1. 기능을 제공하려면 다음 명령을 사용하십시오.

```bash
supabase start # start the supabase stack
supabase functions serve --no-verify-jwt # start the Functions watcher
```

`--no-verify-jwt` 플래그를 사용하면 로컬 개발 중에 JWT 확인을 우회할 수 있습니다.

2. cURL 또는 Postman을 사용하여 `http://127.0.0.1:54321/functions/v1/hello-world/hello`에 대한 GET 요청을 수행합니다.

```bash
curl  --location  'http://127.0.0.1:54321/functions/v1/hello-world/hello'
```

이 요청은 "Hello from hono-server!" 텍스트를 반환해야 합니다.

## 4. 배포

단일 명령을 사용하여 Supabase에 모든 Edge Functions를 배포할 수 있습니다.

```bash
supabase functions deploy
```

또는 배포 명령에 함수 이름을 지정하여 개별 Edge Functions를 배포할 수 있습니다.

```bash
supabase functions deploy hello-world

```

더 많은 배포 방법을 보려면 [프로덕션에 배포](https://supabase.com/docs/guides/functions/deploy)에 대한 Supabase 설명서를 참조하세요.
