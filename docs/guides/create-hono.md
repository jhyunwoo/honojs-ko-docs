# 창조-호노

`create-hono`에서 지원하는 명령줄 옵션 - `npm create hono@latest`, `npx create-hono@latest` 또는 `pnpm create hono@latest`를 실행할 때 실행되는 프로젝트 이니셜라이저입니다.

> [!메모]
> **이 페이지가 필요한 이유는 무엇입니까?** 설치/빠른 시작 예제에는 종종 최소한의 `npm create hono@latest my-app` 명령이 표시됩니다. `create-hono`는 프로젝트 생성을 자동화하고 사용자 정의하기 위해 전달할 수 있는 몇 가지 유용한 플래그를 지원합니다(템플릿 선택, 프롬프트 건너뛰기, 패키지 관리자 선택, 로컬 캐시 사용 등).

## 인수 전달:

`npm create`(또는 `npx`)를 사용하는 경우 초기화 스크립트용 인수는 `--` **뒤**에 배치되어야 합니다. `--` 이후의 모든 항목은 초기화 프로그램으로 전달됩니다.

::: code-group

```sh [npm]
# Forwarding arguments to create-hono (npm requires `--`)
npm create hono@latest my-app -- --template cloudflare-workers
```

```sh [yarn]
# "--template cloudflare-workers" selects the Cloudflare Workers template
yarn create hono my-app --template cloudflare-workers
```

```sh [pnpm]
# "--template cloudflare-workers" selects the Cloudflare Workers template
pnpm create hono@latest my-app --template cloudflare-workers
```

```sh [bun]
# "--template cloudflare-workers" selects the Cloudflare Workers template
bun create hono@latest my-app --template cloudflare-workers
```

```sh [deno]
# "--template cloudflare-workers" selects the Cloudflare Workers template
deno init --npm hono@latest my-app --template cloudflare-workers
```

:::

## 일반적으로 사용되는 인수

| 논쟁                | 설명                                                                                                                                      | 예                         |
| :---------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------ |
| `--template <template>` | 시작 템플릿을 선택하고 대화형 템플릿 프롬프트를 건너뜁니다. 템플릿에는 `bun`, `cloudflare-workers`, `vercel` 등과 같은 이름이 포함될 수 있습니다. | `--template cloudflare-workers` |
| `--install`             | 템플릿이 생성된 후 자동으로 종속성을 설치합니다.                                                                                | `--install`                     |
| `--pm <packageManager>` | 종속성을 설치할 때 실행할 패키지 관리자를 지정합니다. 공통 값: `npm`, `pnpm`, `yarn`.                                         | `--pm pnpm`                     |
| `--offline`             | 최신 원격 템플릿을 가져오는 대신 로컬 캐시/템플릿을 사용하세요. 오프라인 환경이나 결정적 로컬 실행에 유용합니다.      | `--offline`                     |

> [!메모]
> 정확한 템플릿 세트와 사용 가능한 옵션은 `create-hono` 프로젝트에 의해 유지됩니다. 이 문서 페이지에는 가장 많이 사용되는 플래그가 요약되어 있습니다. 신뢰할 수 있는 전체 참조를 보려면 아래 링크된 저장소를 참조하세요.

## 예제 흐름

### 최소한의 대화형

```bash
npm create hono@latest my-app
```

그러면 템플릿과 옵션을 묻는 메시지가 나타납니다.

### 비대화형, 템플릿 및 패키지 관리자 선택

```bash
npm create hono@latest my-app -- --template vercel --pm npm --install
```

그러면 `vercel` 템플릿을 사용하여 `my-app`가 생성되고, `npm`를 사용하여 종속성이 설치되며 대화형 프롬프트가 건너뜁니다.

### 오프라인 캐시 사용(네트워크 없음)

```bash
pnpm create hono@latest my-app --template deno --offline
```

## 문제 해결 및 팁

- 옵션이 인식되지 않는 것으로 나타나면 `npm create` / `npx` 를 사용할 때 `--` 로 전달하고 있는지 확인하세요.
- 최신 템플릿 및 플래그 목록을 보려면 `create-hono` 저장소를 참조하거나 로컬에서 초기화 프로그램을 실행하고 도움말 출력을 따르세요.

## 링크 및 참고자료

- `create-hono` 저장소 : [create-hono](https://github.com/honojs/create-hono)
