# 유효성 검사기의 오류 처리

유효성 검사기를 사용하면 잘못된 입력을 더 쉽게 처리할 수 있습니다. 이 예에서는 사용자 정의 오류 처리 구현을 위해 콜백 결과를 활용할 수 있음을 보여줍니다.

이 스니펫은 [Zod 유효성 검사기](https://github.com/honojs/middleware/blob/main/packages/zod-validator)를 사용하지만 지원되는 모든 유효성 검사기 라이브러리에 유사한 접근 방식을 적용할 수 있습니다.

```ts
import * as z from 'zod'
import { zValidator } from '@hono/zod-validator'

const app = new Hono()

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
})

app.post(
  '/users/new',
  zValidator('json', userSchema, (result, c) => {
    if (!result.success) {
      return c.text('유효하지 않은!', 400)
    }
  }),
  async (c) => {
    const user = c.req.valid('json')
    console.log(user.name) // string
    console.log(user.age) // number
  }
)
```

## 또한보십시오

- [Zod 검증인](https://github.com/honojs/middleware/blob/main/packages/zod-validator)
- [발리봇 검증기](https://github.com/honojs/middleware/tree/main/packages/valibot-validator)
- [타입박스 검사기](https://github.com/honojs/middleware/tree/main/packages/typebox-validator)
- [타이피아 검증기](https://github.com/honojs/middleware/tree/main/packages/typia-validator)
