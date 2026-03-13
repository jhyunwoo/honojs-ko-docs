# Secure Headers 미들웨어

Secure Headers 미들웨어는 보안 헤더 설정을 단순화합니다. Helmet의 기능에서 일부 영감을 받아, 특정 보안 헤더를 활성화하거나 비활성화할 수 있습니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
```

## 사용법

기본적으로 최적의 설정을 사용할 수 있습니다.

```ts
const app = new Hono()
app.use(secureHeaders())
```

false로 설정하면 불필요한 헤더를 억제할 수 있습니다.

```ts
const app = new Hono()
app.use(
  '*',
  secureHeaders({
    xFrameOptions: false,
    xXssProtection: false,
  })
)
```

문자열을 사용하여 기본 헤더 값을 재정의할 수 있습니다.

```ts
const app = new Hono()
app.use(
  '*',
  secureHeaders({
    strictTransportSecurity:
      'max-age=63072000; includeSubDomains; preload',
    xFrameOptions: 'DENY',
    xXssProtection: '1',
  })
)
```

## 지원되는 옵션

각 옵션은 다음 헤더 키-값 쌍에 해당합니다.

| 옵션                          | 헤더                                                                                                                                         | 값                                                                      | 기본값   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------- |
| -                               | X-Powered-By                                                                                                                                   | (헤더 삭제)                                                            | True       |
| contentSecurityPolicy           | [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)                                                               | 사용: [Content-Security-Policy 설정](#setting-content-security-policy) | 설정 없음 |
| contentSecurityPolicyReportOnly | [Content-Security-Policy-Report-Only](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy-Report-Only)           | 사용: [Content-Security-Policy 설정](#setting-content-security-policy) | 설정 없음 |
| trustedTypes                    | [Trusted Types](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/trusted-types)                               | 사용: [Content-Security-Policy 설정](#setting-content-security-policy) | 설정 없음 |
| requireTrustedTypesFor          | [Require Trusted Types For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/require-trusted-types-for)       | 사용: [Content-Security-Policy 설정](#setting-content-security-policy) | 설정 없음 |
| crossOriginEmbedderPolicy       | [Cross-Origin-Embedder-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy)                         | require-corp                                                               | **False**  |
| crossOriginResourcePolicy       | [Cross-Origin-Resource-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Resource-Policy)                         | same-origin                                                                | True       |
| crossOriginOpenerPolicy         | [Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy)                             | same-origin                                                                | True       |
| originAgentCluster              | [Origin-Agent-Cluster](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Origin-Agent-Cluster)                                         | ?1                                                                         | True       |
| referrerPolicy                  | [Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)                                                   | no-referrer                                                                | True       |
| reportingEndpoints              | [Reporting-Endpoints](https://www.w3.org/TR/reporting-1/#header)                                                                               | 사용: [Content-Security-Policy 설정](#setting-content-security-policy) | 설정 없음 |
| reportTo                        | [Report-To](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/report-to)                                       | 사용: [Content-Security-Policy 설정](#setting-content-security-policy) | 설정 없음 |
| strictTransportSecurity         | [Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)                               | max-age=15552000; includeSubDomains                                        | True       |
| xContentTypeOptions             | [X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)                                     | nosniff                                                                    | True       |
| xDnsPrefetchControl             | [X-DNS-Prefetch-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control)                                     | off                                                                        | True       |
| xDownloadOptions                | [X-Download-Options](https://learn.microsoft.com/en-us/archive/blogs/ie/ie8-security-part-v-comprehensive-protection#mime-handling-force-save) | noopen                                                                     | True       |
| xFrameOptions                   | [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)                                                   | SAMEORIGIN                                                                 | True       |
| xPermittedCrossDomainPolicies   | [X-Permitted-Cross-Domain-Policies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Permitted-Cross-Domain-Policies)               | none                                                                       | True       |
| xXssProtection                  | [X-XSS-Protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)                                                 | 0                                                                          | True       |
| permissionPolicy                | [Permissions-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)                                             | 사용: [Permission-Policy 설정](#setting-permission-policy)             | 설정 없음 |

## 미들웨어 충돌

동일한 헤더를 조작하는 미들웨어를 다룰 때에는 명세 순서에 주의하시기 바랍니다.

이 경우 보안 헤더가 작동하고 `x-powered-by`가 제거됩니다.

```ts
const app = new Hono()
app.use(secureHeaders())
app.use(poweredBy())
```

이 경우 Powered-By가 작동하고 `x-powered-by`가 추가됩니다.

```ts
const app = new Hono()
app.use(poweredBy())
app.use(secureHeaders())
```

## 콘텐츠 보안 정책 설정

```ts
const app = new Hono()
app.use(
  '/test',
  secureHeaders({
    reportingEndpoints: [
      {
        name: 'endpoint-1',
        url: 'https://example.com/reports',
      },
    ],
    // -- 또는 대안적으로
    // reportTo: [
    //   {
    //     group: 'endpoint-1',
    //     max_age: 10886400,
    //     endpoints: [{ url: 'https://example.com/reports' }],
    //   },
    // ],
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      childSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", 'https:', 'data:'],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      frameSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      manifestSrc: ["'self'"],
      mediaSrc: ["'self'"],
      objectSrc: ["'none'"],
      reportTo: 'endpoint-1',
      reportUri: '/csp-report',
      sandbox: ['allow-same-origin', 'allow-scripts'],
      scriptSrc: ["'self'"],
      scriptSrcAttr: ["'none'"],
      scriptSrcElem: ["'self'"],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
      styleSrcAttr: ['none'],
      styleSrcElem: ["'self'", 'https:', "'unsafe-inline'"],
      upgradeInsecureRequests: [],
      workerSrc: ["'self'"],
    },
  })
)
```

### `nonce` 속성

`hono/secure-headers`에서 가져온 `NONCE`를 `scriptSrc` 또는 `styleSrc`에 추가하여 [`nonce` 속성](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce)을 `script` 또는 `style` 요소에 추가할 수 있습니다.

```tsx
import { secureHeaders, NONCE } from 'hono/secure-headers'
import type { SecureHeadersVariables } from 'hono/secure-headers'

// `c.get('secureHeadersNonce')`를 추론할 변수 유형을 지정합니다.
type Variables = SecureHeadersVariables

const app = new Hono<{ Variables: Variables }>()

// 사전 정의된 nonce 값을 `scriptSrc`로 설정합니다.
app.get(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      scriptSrc: [NONCE, 'https://allowed1.example.com'],
    },
  })
)

// `c.get('secureHeadersNonce')`에서 값을 가져옵니다.
app.get('/', (c) => {
  return c.html(
    <html>
      <body>
        {/** contents */}
        <script
          src='/js/client.js'
          nonce={c.get('secureHeadersNonce')}
        />
      </body>
    </html>
  )
})
```

Nonce 값을 직접 생성하려는 경우 다음과 같이 함수를 지정할 수도 있습니다.

```tsx
const app = new Hono<{
  Variables: { myNonce: string }
}>()

const myNonceGenerator: ContentSecurityPolicyOptionHandler = (c) => {
  // 이 함수는 요청이 있을 때마다 호출됩니다.
  const nonce = Math.random().toString(36).slice(2)
  c.set('myNonce', nonce)
  return `'nonce-${nonce}'`
}

app.get(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      scriptSrc: [myNonceGenerator, 'https://allowed1.example.com'],
    },
  })
)

app.get('/', (c) => {
  return c.html(
    <html>
      <body>
        {/** contents */}
        <script src='/js/client.js' nonce={c.get('myNonce')} />
      </body>
    </html>
  )
})
```

## 권한 정책 설정

Permission-Policy 헤더를 사용하면 브라우저에서 사용할 수 있는 기능과 API를 제어할 수 있습니다. 설정 방법의 예는 다음과 같습니다.

```ts
const app = new Hono()
app.use(
  '*',
  secureHeaders({
    permissionsPolicy: {
      fullscreen: ['self'], // fullscreen=(self)
      bluetooth: ['none'], // bluetooth=(none)
      payment: ['self', 'https://example.com'], // payment=(self "https://example.com")
      syncXhr: [], // sync-xhr=()
      camera: false, // camera=none
      microphone: true, // microphone=*
      geolocation: ['*'], // geolocation=*
      usb: ['self', 'https://a.example.com', 'https://b.example.com'], // usb=(self "https://a.example.com" "https://b.example.com")
      accelerometer: ['https://*.example.com'], // 가속도계=("https://*.example.com")
      gyroscope: ['src'], // 자이로스코프=(src)
      magnetometer: [
        'https://a.example.com',
        'https://b.example.com',
      ], // 자력계=("https://a.example.com" "https://b.example.com")
    },
  })
)
```
