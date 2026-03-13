# 라우터

라우터는 Hono의 가장 중요한 기능입니다.

Hono에는 5개의 라우터가 있습니다.

## RegExpRouter

**RegExpRouter**는 JavaScript 세계에서 가장 빠른 라우터입니다.

이것을 "RegExp"라고 부르기는 하지만 [path-to-regexp](https://github.com/pillarjs/path-to-regexp)를 사용하는 Express와 유사한 구현은 아닙니다.
그들은 선형 루프를 사용하고 있습니다.
따라서 모든 경로에 대해 정규식 일치가 수행되며 경로가 많아질수록 성능이 저하됩니다.

![](/images/router-linear.jpg)

Hono의 RegExpRouter는 경로 패턴을 "하나의 큰 정규식"으로 바꿉니다.
그러면 일회성 매칭으로 결과를 얻을 수 있습니다.

![](/images/router-regexp.jpg)

이는 대부분의 경우 기수 트리와 같은 트리 기반 알고리즘을 사용하는 방법보다 빠르게 작동합니다.

그러나 RegExpRouter는 모든 라우팅 패턴을 지원하는 것은 아니므로 일반적으로 모든 라우팅 패턴을 지원하는 아래의 다른 라우터 중 하나와 조합하여 사용됩니다.

## TrieRouter

**TrieRouter**는 Trie-tree 알고리즘을 사용하는 라우터입니다.
RegExpRouter와 마찬가지로 선형 루프를 사용하지 않습니다.

![](/images/router-tree.jpg)

이 라우터는 RegExpRouter만큼 빠르지는 않지만 Express 라우터보다 훨씬 빠릅니다.
TrieRouter는 모든 패턴을 지원합니다.

## SmartRouter

**SmartRouter**는 여러 라우터를 사용할 때 유용합니다. 등록된 라우터로부터 추론하여 최적의 라우터를 선택합니다.
Hono는 기본적으로 SmartRouter, RegExpRouter 및 TrieRouter를 사용합니다.

```ts
// Hono의 코어 내부.
readonly defaultRouter: Router = new SmartRouter({
  routers: [new RegExpRouter(), new TrieRouter()],
})
```

애플리케이션이 시작되면 SmartRouter는 라우팅을 기반으로 가장 빠른 라우터를 감지하고 계속 사용합니다.

## LinearRouter

RegExpRouter는 빠르지만 경로 등록 단계가 약간 느릴 수 있습니다.
따라서 요청이 있을 때마다 초기화하는 환경에는 적합하지 않습니다.

**LinearRouter**는 "원샷" 상황에 최적화되어 있습니다.
경로 등록은 선형 접근 방식을 사용하여 문자열을 컴파일하지 않고 경로를 추가하므로 RegExpRouter보다 훨씬 빠릅니다.

다음은 경로 등록 단계를 포함하는 벤치마크 결과 중 하나입니다.

```console
• GET /user/lookup/username/hey
----------------------------------------------------- -----------------------------
LinearRouter     1.82 µs/iter      (1.7 µs … 2.04 µs)   1.84 µs   2.04 µs   2.04 µs
MedleyRouter     4.44 µs/iter     (4.34 µs … 4.54 µs)   4.48 µs   4.54 µs   4.54 µs
FindMyWay       60.36 µs/iter      (45.5 µs … 1.9 ms)  59.88 µs  78.13 µs  82.92 µs
KoaTreeRouter    3.81 µs/iter     (3.73 µs … 3.87 µs)   3.84 µs   3.87 µs   3.87 µs
TrekRouter       5.84 µs/iter     (5.75 µs … 6.04 µs)   5.86 µs   6.04 µs   6.04 µs

summary for GET /user/lookup/username/hey
  LinearRouter
   2.1x faster than KoaTreeRouter
   2.45x faster than MedleyRouter
   3.21x faster than TrekRouter
   33.24x faster than FindMyWay
```

## PatternRouter

**PatternRouter**는 Hono 라우터 중 가장 작은 라우터입니다.

Hono는 이미 컴팩트하지만 리소스가 제한된 환경을 위해 더 작게 만들어야 하는 경우 PatternRouter를 사용하세요.

PatternRouter만 사용하는 애플리케이션의 크기는 15KB 미만입니다.

```console
$ npx wrangler deploy --minify ./src/index.ts
 ⛅️ wrangler 3.20.0
-------------------
Total Upload: 14.68 KiB / gzip: 5.38 KiB
```
