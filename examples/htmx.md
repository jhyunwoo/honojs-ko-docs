# htmx

[htmx](https://htmx.org/)와 함께 Hono를 사용합니다.

## 입력한-htmx

[typed-htmx](https://github.com/Desdaemon/typed-htmx)를 사용하면 htmx 속성에 대한 TypeScript 정의와 함께 JSX를 작성할 수 있습니다.
[typed-htmx 예제 프로젝트](https://github.com/Desdaemon/typed-htmx/blob/main/example/src/types.d.ts)에서 찾은 동일한 패턴을 따라 `hono/jsx`와 함께 사용할 수 있습니다.

패키지를 설치합니다:

```sh
npm i -D typed-htmx
```

`src/global.d.ts`(또는 HonoX를 사용하는 경우 `app/global.d.ts`)에서 `typed-htmx` 유형을 가져옵니다.

```ts
import 'typed-htmx'
```

typed-htmx 정의를 사용하여 Hono의 JSX 유형을 확장합니다.

```ts
// htmx 속성으로 외부 유형을 강화하는 방법에 대한 데모입니다.
// 이 경우 Hono는 자체 네임스페이스에서 해당 유형을 소스로 사용하므로 동일한 작업을 수행합니다.
// 네임스페이스를 직접 확장합니다.
declare module 'hono/jsx' {
  namespace JSX {
    interface HTMLAttributes extends HtmxAttributes {}
  }
}
```

## 또한보십시오

- [htmx](https://htmx.org/)
- [입력-htmx](https://github.com/Desdaemon/typed-htmx)
