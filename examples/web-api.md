# 웹 API

이는 Cloudflare Workers 및 기타 런타임에서 웹 API를 만드는 예입니다.

```ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { basicAuth } from 'hono/basic-auth'
import { prettyJSON } from 'hono/pretty-json'
import { getPosts, getPost, createPost, Post } from './model'

const app = new Hono()
app.get('/', (c) => c.text('예쁜 블로그 API'))
app.use(prettyJSON())
app.notFound((c) => c.json({ message: '찾을 수 없음', ok: false }, 404))

type Bindings = {
  USERNAME: string
  PASSWORD: string
}

const api = new Hono<{ Bindings: Bindings }>()
api.use('/posts/*', cors())

api.get('/posts', (c) => {
  const { limit, offset } = c.req.query()
  const posts = getPosts({ limit, offset })
  return c.json({ posts })
})

api.get('/posts/:id', (c) => {
  const id = c.req.param('id')
  const post = getPost({ id })
  return c.json({ post })
})

api.post(
  '/게시물',
  비동기 (c, 다음) => {
    const auth = basicAuth({
      username: c.env.USERNAME,
      password: c.env.PASSWORD,
    })
    return auth(c, next)
  },
  비동기 (c) => {
    const 게시물 = c.req.json<Post>()를 기다립니다.
    const ok = createPost({ post })
    return c.json({ ok })
  }
)

app.route('/api', api)

export default app
```

## 또한보십시오

- [Hono 예 - 기본](https://github.com/honojs/examples/tree/main/basic)
