# 스트라이프 웹훅

Stripe Webhook 이벤트를 수신하기 위해 Hono를 사용하여 API를 생성하는 방법을 소개합니다.

## 준비

먼저 공식 Stripe SDK를 설치하십시오:

```bash
npm install stripe
```

그리고 `.dev.vars` 파일에 다음 값을 입력하여 스트라이프 API 키를 삽입합니다.

```
STRIPE_API_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

다음 문서를 통해 Stripe API 키에 대해 알아볼 수 있습니다.

- 비밀 키: https://docs.stripe.com/keys
- 웹훅 시크릿: https://docs.stripe.com/webhooks

## Stripe Webhook 이벤트에 대해 API를 보호하는 방법

웹훅 이벤트를 처리하는 API는 공개적으로 액세스할 수 있습니다. 따라서 악의적인 제3자가 Stripe의 웹훅 이벤트 객체를 스푸핑하고 요청을 보내는 등의 공격으로부터 이를 보호할 수 있는 메커니즘이 필요합니다. Stripe의 경우 웹훅 비밀을 발급하고 각 요청을 확인하여 API를 보호할 수 있습니다.

자세히 알아보기: https://docs.stripe.com/webhooks?lang=node#verify-official-libraries

## 호스팅 환경 또는 프레임워크를 통해 웹훅 API 구현

Stripe으로 서명 확인을 수행하려면 원시 요청 본문이 필요합니다.
프레임워크를 사용할 때 원본 본문이 수정되지 않았는지 확인해야 합니다. 원시 요청 본문이 변경되면 확인이 실패합니다.

Hono의 경우 `context.req.text()` 메서드를 통해 원시 요청 본문을 가져올 수 있습니다. 따라서 다음 예시와 같이 웹훅 API를 생성할 수 있습니다.

```ts
import Stripe from 'stripe'
import { Hono } from 'hono'
import { env } from 'hono/adapter'

const app = new Hono()

app.post('/webhook', async (context) => {
  const { STRIPE_SECRET_API_KEY, STRIPE_WEBHOOK_SECRET } =
    env(context)
  const stripe = new Stripe(STRIPE_SECRET_API_KEY)
  const signature = context.req.header('stripe-signature')
  try {
    if (!signature) {
      return context.text('', 400)
    }
    const body = await context.req.text()
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    )
    switch (event.type) {
      case '지불의도.생성됨': {
        console.log(event.data.object)
        break
      }
      default:
        break
    }
    return context.text('', 200)
  } catch (err) {
    const errorMessage = `⚠️  Webhook signature verification failed. ${
      err instanceof Error ? err.message : '내부 서버 오류'
    }`
    console.log(errorMessage)
    return context.text(errorMessage, 400)
  }
})

export default app
```

## 또한보십시오

- Stripe Webhooks에 대한 세부정보:
  https://docs.stripe.com/webhooks
- 결제 처리 구현:
  https://docs.stripe.com/payments/handling-payment-events
- 구독 구현:
  https://docs.stripe.com/billing/subscriptions/webhooks
- Stripe에서 보낸 웹훅 이벤트 목록:
  https://docs.stripe.com/api/events
- Cloudflare의 샘플 템플릿:
  https://github.com/stripe-samples/stripe-node-cloudflare-worker-template/
