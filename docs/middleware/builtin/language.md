# 언어 미들웨어

Language Detector 미들웨어는 다양한 소스에서 사용자가 선호하는 언어(로케일)를 자동으로 결정하고 `c.get('language')`를 통해 사용할 수 있도록 합니다. 탐지 전략에는 쿼리 매개변수, 쿠키, 헤더 및 URL 경로 세그먼트가 포함됩니다. 국제화(i18n) 및 로캘별 콘텐츠에 적합합니다.

## 가져오기

```ts
import { Hono } from 'hono'
import { languageDetector } from 'hono/language'
```

## 기본 사용법

영어로 대체하여 쿼리 문자열, 쿠키 및 헤더(기본 순서)에서 언어를 감지합니다.

```ts
const app = new Hono()

app.use(
  languageDetector({
    supportedLanguages: ['en', 'ar', 'ja'], // Must include fallback
    fallbackLanguage: 'en', // Required
  })
)

app.get('/', (c) => {
  const lang = c.get('language')
  return c.text(`Hello! Your language is ${lang}`)
})
```

### 클라이언트 예시

```sh
# Via path
curl http://localhost:8787/ar/home

# Via query parameter
curl http://localhost:8787/?lang=ar

# Via cookie
curl -H 'Cookie: language=ja' http://localhost:8787/

# Via header
curl -H 'Accept-Language: ar,en;q=0.9' http://localhost:8787/
```

## 기본 구성

```ts
export const DEFAULT_OPTIONS: DetectorOptions = {
  order: ['querystring', 'cookie', 'header'],
  lookupQueryString: 'lang',
  lookupCookie: 'language',
  lookupFromHeaderKey: 'accept-language',
  lookupFromPathIndex: 0,
  caches: ['cookie'],
  ignoreCase: true,
  fallbackLanguage: 'en',
  supportedLanguages: ['en'],
  cookieOptions: {
    sameSite: 'Strict',
    secure: true,
    maxAge: 365 * 24 * 60 * 60,
    httpOnly: true,
  },
  debug: false,
}
```

## 주요 행동

### 탐지 작업흐름

1. **순서**: 기본적으로 다음 순서로 소스를 확인합니다.
   - 쿼리 매개변수(?lang=ar)
   - 쿠키(언어=ar)
   - Accept-Language 헤더

2. **캐싱**: 감지된 언어를 쿠키에 저장합니다(기본적으로 1년).

3. **대체**: 유효한 감지가 없는 경우 `fallbackLanguage`를 사용합니다(`supportedLanguages`에 있어야 함).

## 고급 구성

### 사용자 정의 탐지 순서

URL 경로 감지 우선순위 지정(예: /en/about):

```ts
app.use(
  languageDetector({
    order: ['path', 'cookie', 'querystring', 'header'],
    lookupFromPathIndex: 0, // /en/profile → index 0 = 'en'
    supportedLanguages: ['en', 'ar'],
    fallbackLanguage: 'en',
  })
)
```

### 점진적인 로케일 일치

`ja-JP`와 같이 감지된 로케일 코드가 `supportedLanguages`에 없으면 미들웨어는 일치하는 항목을 찾기 위해 하위 태그를 점진적으로 자릅니다. 예를 들어 `zh-Hant-CN`는 `zh-Hant`를 시도한 다음 `zh`를 시도합니다. 정확히 일치하는 것이 항상 선호됩니다.

```ts
app.use(
  languageDetector({
    supportedLanguages: ['en', 'ja', 'zh-Hant'],
    fallbackLanguage: 'en',
  })
)

// Accept-Language: ja-JP → 'ja'와 일치
// Accept-Language: zh-Hant-CN → 'zh-Hant'와 일치
```

### 언어 코드 변환

복잡한 코드를 정규화합니다(예: en-US → en):

```ts
app.use(
  languageDetector({
    convertDetectedLanguage: (lang) => lang.split('-')[0],
    supportedLanguages: ['en', 'ja'],
    fallbackLanguage: 'en',
  })
)
```

### 쿠키 구성

```ts
app.use(
  languageDetector({
    lookupCookie: 'app_lang',
    caches: ['cookie'],
    cookieOptions: {
      path: '/', // Cookie path
      sameSite: 'Lax', // Cookie same-site policy
      secure: true, // Only send over HTTPS
      maxAge: 86400 * 365, // 1 year expiration
      httpOnly: true, // Not accessible via JavaScript
      domain: '.example.com', // Optional: specific domain
    },
  })
)
```

쿠키 캐싱을 비활성화하려면:

```ts
languageDetector({
  caches: false,
})
```

### 디버깅

로그 감지 단계:

```ts
languageDetector({
  debug: true, // Shows: "Detected from querystring: ar"
})
```

## 옵션 참조

### 기본 옵션

| 옵션               | 유형             | 기본                               | 필수의 | 설명            |
| :------------------- | :--------------- | :------------------------------------ | :------- | :--------------------- |
| `supportedLanguages` | `string[]`       | `['en']`                              | 예      | 허용되는 언어 코드 |
| `fallbackLanguage`   | `string`         | `'en'`                                | 예      | 기본 언어       |
| `order`              | `DetectorType[]` | `['querystring', 'cookie', 'header']` | 아니요       | 검출 순서     |
| `debug`              | `boolean`        | `false`                               | 아니요       | 로깅 활성화         |

### 탐지 옵션

| 옵션                | 유형     | 기본             | 설명          |
| :-------------------- | :------- | :------------------ | :------------------- |
| `lookupQueryString`   | `string` | `'lang'`            | 쿼리 매개변수 이름 |
| `lookupCookie`        | `string` | `'language'`        | 쿠키 이름          |
| `lookupFromHeaderKey` | `string` | `'accept-language'` | 헤더 이름          |
| `lookupFromPathIndex` | `number` | `0`                 | 경로 세그먼트 인덱스   |

### 쿠키 옵션

| 옵션                   | 유형                          | 기본      | 설명          |
| :----------------------- | :---------------------------- | :----------- | :------------------- |
| `caches`                 | `캐시 유형[] \| 거짓`        | `['cookie']` | 캐시 설정       |
| `cookieOptions.path`     | `string`                      | `'/'`        | 쿠키 경로          |
| `cookieOptions.sameSite` | ``엄격'\| '락스' \| '없음'` | `'Strict'`   | SameSite 정책      |
| `cookieOptions.secure`   | `boolean`                     | `true`       | HTTPS 전용           |
| `cookieOptions.maxAge`   | `number`                      | `31536000`   | 만료(초) |
| `cookieOptions.httpOnly` | `boolean`                     | `true`       | JS 접근성     |
| `cookieOptions.domain`   | `string`                      | `undefined`  | 쿠키 도메인        |

### 고급 옵션

| 옵션                    | 유형                       | 기본     | 설명               |
| :------------------------ | :------------------------- | :---------- | :------------------------ |
| `ignoreCase`              | `boolean`                  | `true`      | 대소문자를 구분하지 않는 일치 |
| `convertDetectedLanguage` | `(lang: string) => string` | `undefined` | 언어 코드 변환기 |

## 검증 및 오류 처리

- `fallbackLanguage`는 `supportedLanguages`에 있어야 합니다(설정 중에 오류 발생).
- `lookupFromPathIndex`는 0 이상이어야 합니다.
- 잘못된 구성으로 인해 미들웨어 초기화 중에 오류가 발생합니다.
- 실패한 감지에는 자동으로 `fallbackLanguage`를 사용합니다.

## 일반적인 조리법

### 경로 기반 라우팅

```ts
app.get('/:lang/home', (c) => {
  const lang = c.get('language') // 'en', 'ar', etc.
  return c.json({ message: getLocalizedContent(lang) })
})
```

### 여러 지원 언어

```ts
languageDetector({
  supportedLanguages: ['en', 'en-GB', 'ar', 'ar-EG'],
  convertDetectedLanguage: (lang) => lang.replace('_', '-'), // Normalize
})
```
