# Pylon

Pylon을 사용하여 GraphQL API를 구축하는 것은 간단하고 간단합니다. Pylon은 Hono를 기반으로 구축되고 코드 우선 GraphQL API 개발을 제공하는 백엔드 프레임워크입니다.

GraphQL 스키마는 TypeScript 정의에서 실시간으로 생성되므로 서비스 로직 작성에만 집중할 수 있습니다. 이 접근 방식은 개발 속도를 크게 향상시키고 유형 안전성을 향상시키며 오류를 줄입니다.

코드의 주요 변경 사항은 즉시 API에 반영되므로 변경 사항이 해당 기능에 어떤 영향을 미치는지 즉시 확인할 수 있습니다.

자세한 내용은 [Pylon](https://pylon.cronit.io)를 확인하세요.

## 새로운 Pylon 서비스 설정

Pylon을 사용하면 `npm create pylon` 명령을 사용하여 새 서비스를 생성할 수 있습니다. 이 명령은 기본 프로젝트 구조와 구성을 사용하여 새로운 Pylon 프로젝트를 생성합니다.
설정 프로세스 중에 Bun, Node.js, Cloudflare Workers 등 원하는 런타임을 선택할 수 있습니다.

**이 가이드에서는 Bun 런타임을 사용합니다.**

### 새 프로젝트 만들기

새 Pylon 프로젝트를 만들려면 다음 명령어를 실행하세요.

```bash
npm create pylon my-pylon@latest
```

그러면 기본 Pylon 프로젝트 구조를 사용하여 `my-pylon`라는 새 디렉터리가 생성됩니다.

### 프로젝트 구조

Pylon 프로젝트는 다음과 같이 구성됩니다.

```
my-pylon/
├── .pylon/
├── src/
│   ├── index.ts
├── package.json
├── tsconfig.json
```

- `.pylon/`: 프로젝트의 프로덕션 빌드가 포함되어 있습니다.
- `src/`: 프로젝트의 소스 코드가 포함되어 있습니다.
- `src/index.ts`: Pylon 서비스의 진입점입니다.
- `package.json`: npm 패키지 구성 파일입니다.
- `tsconfig.json`: TypeScript 구성 파일입니다.

### 기본 예

다음은 기본 Pylon 서비스의 예입니다.

```ts
import { app } from '@getcronit/pylon'

export const graphql = {
  Query: {
    sum: (a: number, b: number) => a + b,
  },
  Mutation: {
    divide: (a: number, b: number) => a / b,
  },
}

export default app
```

## API 보호하기

Pylon은 클라우드 기반 ID 및 액세스 관리 솔루션인 ZITADEL과 통합되어 API에 대한 보안 인증 및 권한 부여를 제공합니다. [ZITADEL 문서](https://zitadel.com/docs/examples/secure-api/pylon)에 설명된 단계에 따라 Pylon API를 쉽게 보호할 수 있습니다.

## 더 복잡한 API 만들기

Pylon을 사용하면 실시간 스키마 생성 기능을 활용하여 더 복잡한 API를 생성할 수 있습니다. 지원되는 TypeScript 유형 및 API 정의 방법에 대한 자세한 내용은 [Pylon 문서](https://pylon.cronit.io/docs/core-concepts/type-safety-and-type-integration)를 참조하세요.

이 예에서는 Pylon에서 복합 유형 및 서비스를 정의하는 방법을 보여줍니다. TypeScript 클래스 및 메서드를 활용하면 데이터베이스, 외부 서비스 및 기타 리소스와 상호 작용하는 강력한 API를 만들 수 있습니다.

```ts
import { app } from '@getcronit/pylon'

class Post {
  id: string
  title: string

  constructor(id: string, title: string) {
    this.id = id
    this.title = title
  }
}

class User {
  id: string
  name: string

  constructor(id: string, name: string) {
    this.id = id
    this.name = name
  }

  static async getById(id: string): Promise<User> {
    // 데이터베이스에서 사용자 데이터 가져오기
    return new User(id, '존 도')
  }

  async posts(): Promise<Post[]> {
    // 데이터베이스에서 이 사용자의 게시물을 가져옵니다.
    return [new Post('1', '안녕, 세상!')]
  }

  async $createPost(title: string, content: string): Promise<Post> {
    // 데이터베이스에 이 사용자에 대한 새 게시물을 만듭니다.
    return new Post('2', title)
  }
}

export const graphql = {
  Query: {
    user: User.getById,
  },
  Mutation: {
    createPost: (userId: string, title: string, content: string) => {
      const user = User.getById(userId)
      return user.$createPost(title, content)
    },
  },
}

export default app
```

## API 호출하기

Pylon API는 모든 GraphQL 클라이언트 라이브러리를 사용하여 호출할 수 있습니다. 개발 목적으로는
API와 실시간으로 상호 작용할 수 있는 웹 기반 GraphQL IDE인 Pylon Playground를 사용하는 것이 좋습니다.

1. 프로젝트 디렉터리에서 `bun run dev`를 실행하여 Pylon 서버를 시작합니다.
2. `http://localhost:3000/graphql`로 이동하여 브라우저에서 Pylon 플레이그라운드를 엽니다.
3. 왼쪽 패널에 GraphQL 쿼리 또는 변형을 작성하세요.

![](/images/pylon-example.png)

## Hono 컨텍스트에 접근하기

`getContext` 함수를 사용하면 코드 어디에서나 Hono 컨텍스트에 액세스할 수 있습니다. 이 함수는 요청, 응답 및 기타 컨텍스트별 데이터에 대한 정보가 포함된 현재 컨텍스트 개체를 반환합니다.

```ts
import { app, getContext } from '@getcronit/pylon'

export const graphql = {
  Query: {
    hello: () => {
      const context = getContext()
      return `Hello, ${context.req.headers.get('user-agent')}`
    },
  },
}

export default app
```

Hono 컨텍스트 개체 및 해당 속성에 대한 자세한 내용은 [Hono 문서](https://hono.dev/docs/api/context) 및 [Pylon 문서](https://pylon.cronit.io/docs/core-concepts/context-management)를 참조하세요.

## Hono는 어디에 적합할까요?

Pylon은 웹 애플리케이션 및 API 구축을 위한 경량 웹 프레임워크인 Hono를 기반으로 구축되었습니다. Hono는 HTTP 요청 및 응답을 처리하기 위한 핵심 기능을 제공하는 반면, Pylon은 이 기능을 확장하여 GraphQL API 개발을 지원합니다.

GraphQL 외에도 Pylon을 사용하면 기본 Hono 앱 인스턴스에 액세스하여 사용자 지정 경로와 미들웨어를 추가할 수도 있습니다. 이를 통해 Hono의 모든 기능을 활용하는 보다 복잡한 API 및 서비스를 구축할 수 있습니다.

```ts
import { app } from '@getcronit/pylon'

export const graphql = {
  Query: {
    sum: (a: number, b: number) => a + b,
  },
  Mutation: {
    divide: (a: number, b: number) => a / b,
  },
}

// Pylon 앱에 사용자 정의 경로 추가
app.get('/hello', (ctx, next) => {
  return new Response('안녕, 세상!')
})
```

## 결론

Pylon은 GraphQL API 개발을 단순화하는 강력한 웹 프레임워크입니다. TypeScript 유형 정의를 활용하여 Pylon은 실시간 스키마 생성을 제공하여 유형 안전성을 강화하고 오류를 줄입니다. Pylon을 사용하면 비즈니스 요구 사항을 충족하는 안전하고 확장 가능한 API를 빠르게 구축할 수 있습니다. Pylon과 Hono의 통합을 통해 GraphQL API 개발에 집중하면서 Hono의 모든 기능을 사용할 수 있습니다.

Pylon에 대한 자세한 내용은 [공식 문서](https://pylon.cronit.io)를 확인하세요.

## 함께 보기

- [Pylon](https://github.com/getcronit/pylon)
- [Pylon 문서](https://pylon.cronit.io)
- [Hono 문서](https://hono.dev/docs)
- [ZITADEL 문서](https://zitadel.com/docs/examples/secure-api/pylon)
