# 웹어셈블리(WASI 포함)

[WebAssembly][wasm-core]는 웹 ​​브라우저 내부와 외부에서 실행되는 안전한 샌드박스형 휴대용 런타임입니다.

실제로:

- 언어(Javascript 등) WebAssembly로 _컴파일(`.wasm` 파일)
- WebAssembly 런타임(예: [`wasmtime`][wasmtime] 또는 [`jco`][jco])은 _running_ WebAssembly 바이너리를 활성화합니다.

핵심 WebAssembly에는 로컬 파일 시스템이나 소켓과 같은 것에 대한 액세스가 _no_ 있지만 [WebAssembly 시스템 인터페이스][wasi]
WebAssebly 워크로드에서 플랫폼 정의를 활성화하는 단계입니다.

이는 _with_ WASI, WebAssembly가 파일, 소켓 등에서 작동할 수 있음을 의미합니다.

::: info
WASI 인터페이스를 직접 살펴보고 싶으십니까? [`wasi:http`][wasi-http]를 확인하세요.
:::

JS에서 WASI가 포함된 WebAssembly 지원은 [StarlingMonkey][sm]에 의해 제공되며 JS의 웹 표준에 중점을 두고 있습니다.
StarlingMonkey 및 Hono, **Hono는 \*WASI 지원 WebAssembly 생태계와 함께 즉시 작동합니다.**

[문자]: https://github.com/bytecodealliance/StarlingMonkey
[wasm-코어]: https://webassembly.org/
[와시]: https://wasi.dev/
[bca]: https://bytecodealliance.org/
[와시-http]: https://github.com/WebAssembly/wasi-http

## 1. 설정

WebAssembly JS 생태계는 WASI 지원 WebAssembly 구성 요소 구축을 쉽게 시작할 수 있는 도구를 제공합니다.

- [StarlingMonkey][sm]은 WebAssembly로 컴파일하고 구성 요소를 활성화하는 [SpiderMonkey][spidermonkey]의 포크입니다.
- [`componentize-js`][comComponentize-js]는 Javascript ES 모듈을 WebAssembly 구성 요소로 전환합니다.
- [`jco`][jco]는 NodeJS 또는 브라우저와 같은 환경에서 구성 요소를 빌드하고, 유형을 생성하고, 구성 요소를 실행하는 멀티 도구입니다.

::: info
웹어셈블리는 개방형 생태계를 갖고 있으며 오픈 소스이며 핵심 프로젝트는 주로 [Bytecode Alliance][bca]와 그 회원이 관리합니다.

새로운 기능, 문제, 끌어오기 요청 및 기타 유형의 기여는 언제나 환영합니다.
:::

WebAssembly에서 Hono의 스타터는 아직 사용할 수 없지만 WebAssembly Hono 프로젝트를 시작할 수 있습니다.
다른 것과 마찬가지로:

::: code-group

```sh [npm]
mkdir my-app
cd my-app
npm init
npm i hono
npm i -D @bytecodealliance/jco @bytecodealliance/componentize-js @bytecodealliance/jco-std
npm i -D rolldown
```

````sh [yarn]
mkdir my-app
cd my-app
npm init
yarn add hono
yarn add -D @bytecodealliance/jco @bytecodealliance/componentize-js @bytecodealliance/jco-std
yarn add -D rolldown
G```

```sh [pnpm]
mkdir my-app
cd my-app
pnpm init --init-type module
pnpm add hono
pnpm add -D @bytecodealliance/jco @bytecodealliance/componentize-js @bytecodealliance/jco-std
pnpm add -D rolldown
````

```sh [bun]
mkdir my-app
cd my-app
npm init
bun add hono
bun add -D @bytecodealliance/jco @bytecodealliance/componentize-js @bytecodealliance/jco-std
```

:::

::: info
To ensure your project uses ES modules, ensure `type` is set to `"module"` in `package.json`
:::

After entering the `my-app` folder, install dependencies, and initialize Typescript:

::: code-group

```sh [npm]
npm i
npx tsc --init
```

```sh [yarn]
yarn
yarn tsc --init
```

```sh [pnpm]
pnpm i
pnpm exec --init
```

```sh [bun]
bun i
```

:::

Once you have a basic typescript configuration file (`tsconfig.json`), please ensure it has the following configuration:

- `compilerOptions.module` set to `"nodenext"`

Since `componentize-js` (and `jco` which re-uses it) supports only single JS files,
bundling is necessary, so [`rolldown`][rolldown] can be used to create a single file bundle.

A Rolldown configuration (`rolldown.config.mjs`) like the following can be used:

```js
import { defineConfig } from 'rolldown'

export default defineConfig({
  input: 'src/component.ts',
  external: /wasi:.*/,
  output: {
    file: 'dist/component.js',
    format: 'esm',
  },
})
```

::: info
Feel free to use any other bundlers that you're more comfortable with (`rolldown`, `esbuild`, `rollup`, etc)
:::

[jco]: https://github.com/bytecodealliance/jco
[componentize-js]: https://github.com/bytecodealliance/componentize-js
[rolldown]: https://rolldown.rs
[spidermonkey]: https://spidermonkey.dev/

## 2. Set up WIT interface & dependencies

[WebAssembly Inteface Types (WIT)][wit] is an Interface Definition Language ("IDL") that governs what functionality
a WebAssembly component uses ("imports"), and what it provides ("exports").

Amongst the standardized WIT interfaces, [`wasi:http`][wasi-http] is for dealing with HTTP requests (whether it's
receiving them or sending them out), and since we intend to make a web server, our component must declare the use
of `wasi:http/incoming-handler` in it's [WIT world][wit-world]:

First, let's set up the component's WIT world in a file called `wit/component.wit`:

```txt
package example:hono;

world component {
    export wasi:http/incoming-handler@0.2.6;
}
```

Put simply, the WIT file above means that our component "providers" the functionality of "receiving"/"handling incoming"
HTTP requests.

The `wasi:http/incoming-handler` interface relies on upstream standardized WIT interfaces (specifications
on how requests are structured, etc).

To pull those third party (Bytecode Alliance maintained) WIT interaces, one tool we can use is [`wkg`][wkg]:

```sh
wkg wit fetch
```

Once `wkg` has finished running, you should find your `wit` folder populated with a new `deps` folder alongside `component.wit`:

```
wit
├── component.wit
└── deps
    ├── wasi-cli-0.2.6
    │   └── package.wit
    ├── wasi-clocks-0.2.6
    │   └── package.wit
    ├── wasi-http-0.2.6
    │   └── package.wit
    ├── wasi-io-0.2.6
    │   └── package.wit
    └── wasi-random-0.2.6
        └── package.wit
```

[wkg]: https://github.com/bytecodealliance/wasm-pkg-tools
[wit-world]: https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md#wit-worlds
[wit]: https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md

## 3. Hello Wasm

To build a HTTP server in WebAssembly, we can make use of the [`jco-std`][jco-std] project, which
contains helpers that make the experience very similar to the standard Hono experience.

Let's fulfill our `component` world with a basic Hono application as a WebAssembly component in
a file called `src/component.ts`:

```ts
import { Hono } from 'hono'
import { fire } from '@bytecodealliance/jco-std/wasi/0.2.6/http/adapters/hono/server'

const app = new Hono()

app.get('/hello', (c) => {
  return c.json({ message: 'Hello from WebAssembly!' })
})

fire(app)

// 위에서 사용하도록 구성된 wasi HTTP를 사용하여 `fire()`를 호출했지만,
// 실제로 `wasi:http/incoming-handler` 인터페이스 객체를 내보내야 합니다.
// jco와 componentize-js는 WASI 인터페이스와 일치하는 ES 모듈 내보내기를 찾을 것입니다.
export { incomingHandler } from '@bytecodealliance/jco-std/wasi/0.2.6/http/adapters/hono/server'
```

## 4. Build

Since we're using Rolldown (and it's configured to handle Typescript compilation), we can use it to build and bundle:

::: code-group

```sh [npm]
npx rolldown -c
```

```sh [yarn]
yarn rolldown -c
```

```sh [pnpm]
pnpm exec rolldown -c
```

```sh [bun]
bun build --target=bun --outfile=dist/component.js ./src/component.ts
```

:::

::: info
The bundling step is necessary because WebAssembly JS ecosystem tooling only currently supports a single JS file,
and we'd like to include Hono along with related libraries.

For components with simpler requirements, bundlers are not necessary.
:::

To build your WebAssembly component, use `jco` (and indirectly `componentize-js`):

::: code-group

```sh [npm]
npx jco componentize -w wit -o dist/component.wasm dist/component.js
```

```sh [yarn]
yarn jco componentize -w wit -o dist/component.wasm dist/component.js
```

```sh [pnpm]
pnpm exec jco componentize -w wit -o dist/component.wasm dist/component.js
```

```sh [bun]
bun run jco componentize -w wit -o dist/component.wasm dist/component.js
```

:::

## 3. Run

To run your Hono WebAssembly HTTP server, you can use any WASI-enabled WebAssembly runtime:

- [`wasmtime`][wasmtime]
- `jco` (runs in NodeJS)

In this guide, we'll use `jco serve` since it's already installed.

::: warning
`jco serve` is meant for development, and is not recommended for production use.
:::

[wasmtime]: https://wasmtime.dev

::: code-group

```sh [npm]
npx jco serve dist/component.wasm
```

```sh [yarn]
yarn jco serve dist/component.wasm
```

```sh [pnpm]
pnpm exec jco serve dist/component.wasm
```

```sh [bun]
bun run jco serve dist/component.wasm
```

:::

You should see output like the following:

```
$ npx jco serve dist/component.wasm
Server listening @ localhost:8000...
```

Sending a request to `localhost:8000/hello` will produce the JSON output you've specified in your Hono application.

You should see output like the following:

```json
{ "message": "Hello from WebAssembly!" }
```

::: info
`jco serve` works by converting the WebAssembly component into a basic WebAssembly coremodule,
so that it can be run in runtimes like NodeJS and the browser.

This process is normally run via `jco transpile`, and is the way we can use JS engines like NodeJS
and the browser (which may use V8 or other Javascript engines) as WebAssembly Component runtimes.

How `jco transpile` is outside the scope of this guide, you can read more about it in [the Jco book][jco-book]
:::

## More information

To learn more about WASI, WebAssembly components and more, see the following resources:

- [BytecodeAlliance Component Model book][cm-book]
- [`jco` codebase][jco]
  - [`jco` example components][jco-example-components] (in particular the [Hono example][jco-example-component-hono])
- [Jco book][jco-book]
- [`componentize-js` codebase][componentize-js]
- [StarlingMonkey codebase][sm]

To reach out to the WebAssembly community with questions, comments, contributions or to file issues:

- [Bytecode Alliance Zulip](https://bytecodealliance.zulipchat.com) (consider posting in the [#jco channel](https://bytecodealliance.zulipchat.com/#narrow/channel/409526-jco))
- [Jco repository](https://github.com/bytecodealliance/jco)
- [componentize-js repository](https://github.com/bytecodealliance/componentize-js)

[cm-book]: https://component-model.bytecodealliance.org/
[jco-book]: https://bytecodealliance.github.io/jco/
[jco-example-components]: https://github.com/bytecodealliance/jco/tree/main/examples/components
[jco-example-component-hono]: https://github.com/bytecodealliance/jco/tree/main/examples/components/http-server-hono
