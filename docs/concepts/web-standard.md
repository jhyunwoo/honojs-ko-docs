# 웹 표준

Hono는 Fetch와 같은 **웹 표준**만 사용합니다.
원래 `fetch` 함수에서 사용되었으며 HTTP 요청 및 응답을 처리하는 기본 개체로 구성됩니다.
`Requests` 및 `Responses` 외에도 `URL`, `URLSearchParam`, `Headers` 등이 있습니다.

Cloudflare Workers, Deno 및 Bun도 웹 표준을 기반으로 구축되었습니다.
예를 들어 "Hello World"를 반환하는 서버는 아래와 같이 작성할 수 있습니다. 이는 Cloudflare Workers 및 Bun에서 실행될 수 있습니다.

```ts twoslash
export default {
  async fetch() {
    return new Response('안녕하세요 세계')
  },
}
```

Hono는 웹 표준만 사용합니다. 즉, Hono는 이를 지원하는 모든 런타임에서 실행될 수 있습니다.
또한 Node.js 어댑터가 있습니다. Hono는 다음 런타임에서 실행됩니다.

- Cloudflare Workers (`workerd`)
- Deno
- Bun
- Fastly Compute
- AWS 람다
- Node.js
- Vercel(에지라이트)
- WebAssembly([`wasi:http`][wasi-http]를 통한 [WebAssembly 시스템 인터페이스(WASI)][wasi] 포함)

Netlify 및 기타 플랫폼에서도 작동합니다.
모든 플랫폼에서 동일한 코드가 실행됩니다.

Cloudflare Workers, Deno, Shopify 등은 "웹 상호 운용성"을 활성화하기 위해 웹 표준을 사용할 가능성을 논의하기 위해 [WinterCG](https://wintercg.org)를 출시했습니다.
Hono는 그들의 발걸음을 따라 **웹 표준의 표준**을 향해 나아갈 것입니다.

[와시]: https://github.com/WebAssembly/wasi
[와시-http]: https://github.com/WebAssembly/wasi-http
