# Google Cloud Run

[Google Cloud Run](https://cloud.google.com/run)는 Google Cloud에서 구축한 서버리스 플랫폼입니다. 이벤트에 대한 응답으로 코드를 실행할 수 있으며 Google은 기본 컴퓨팅 리소스를 자동으로 관리합니다.

Google Cloud Run는 컨테이너를 사용하여 서비스를 실행합니다. 즉, Dockerfile을 제공하여 원하는 런타임(예: Deno 또는 Bun)을 사용할 수 있습니다. Dockerfile이 제공되지 않으면 Google Cloud Run는 기본 Nodejs 빌드팩을 사용합니다.

이 가이드에서는 이미 Google Cloud 계정과 결제 계정이 있다고 가정합니다.

## 1. CLI 설치

Google Cloud Platform으로 작업할 때는 [gcloud CLI](https://cloud.google.com/sdk/docs/install)를 사용하는 것이 가장 쉽습니다.

예를 들어 Homebrew를 사용하는 MacOS에서는 다음과 같습니다.

```sh
brew install --cask gcloud-cli
```

CLI로 인증합니다.

```sh
gcloud auth login
```

## 2. 프로젝트 설정

프로젝트를 생성합니다. 프롬프트에서 자동 생성된 프로젝트 ID를 수락합니다.

```sh
gcloud projects create --set-as-default --name="my app"
```

쉽게 재사용할 수 있도록 프로젝트 ID 및 프로젝트 번호에 대한 환경 변수를 만듭니다. `gcloud projects list` 명령을 사용하여 프로젝트가 성공적으로 반환되기까지 최대 30초가 걸릴 수 있습니다.

```sh
PROJECT_ID=$(gcloud projects list \
    --format='value(projectId)' \
    --filter='name="my app"')

PROJECT_NUMBER=$(gcloud projects list \
    --format='value(projectNumber)' \
    --filter='name="my app"')

echo $PROJECT_ID $PROJECT_NUMBER
```

청구 계정 ID를 찾으세요.

```sh
gcloud billing accounts list
```

이전 명령의 청구 계정을 프로젝트에 추가합니다.

```sh
gcloud billing projects link $PROJECT_ID \
    --billing-account=[billing_account_id]
```

필수 API를 활성화합니다.

```sh
gcloud services enable run.googleapis.com \
    cloudbuild.googleapis.com
```

Cloud Build에 액세스할 수 있도록 서비스 계정 권한을 업데이트하세요.

```sh
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member=serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
    --role=roles/run.builder
```

## 3. 헬로 월드

"create-hono" 명령으로 프로젝트를 시작하세요. `nodejs`를 선택합니다.

```sh
npm create hono@latest my-app
```

`my-app`로 이동하여 종속성을 설치합니다.

```sh
cd my-app
npm i
```

`src/index.ts`의 포트를 `8080`로 업데이트합니다.

<!-- prettier-ignore -->
```ts
import { serve } from '@hono/node-server'
import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('안녕하세요 Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000 // [!code --]
  port: 8080 // [!code ++]
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
```

개발 서버를 로컬에서 실행합니다. 그런 다음 웹 브라우저에서 http://localhost:8080에 액세스하십시오.

```sh
npm run dev
```

## 4. 배포

배포를 시작하고 대화형 프롬프트를 따릅니다(예: 지역 선택).

```sh
gcloud run deploy my-app --source . --allow-unauthenticated
```

## 런타임 변경

Deno 또는 Bun 런타임(또는 사용자 정의된 Nodejs 컨테이너)을 사용하여 배포하려면 원하는 환경에 `Dockerfile`(및 선택적으로 `.dockerignore`)를 추가하세요.

컨테이너화에 대한 자세한 내용은 다음을 참조하세요.

- [노드JS](/docs/getting-started/nodejs#building-deployment)
- [Bun](https://bun.com/guides/ecosystem/docker)
- [Deno](https://docs.deno.com/examples/google_cloud_run_tutorial)
