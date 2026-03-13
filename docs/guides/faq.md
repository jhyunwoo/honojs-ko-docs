# 자주 묻는 질문

본 가이드는 Hono에 대한 자주 묻는 질문(FAQ)과 해결 방법을 모아 놓은 것입니다.

## Hono에 대한 공식 Renovate 구성이 있습니까?

Hono 팀은 현재 [Renovate](https://github.com/renovatebot/renovate) 구성을 유지 관리하지 않습니다.
따라서 다음과 같이 타사 renovate-config를 사용하시기 바랍니다.

`renovate.json`에서 :

```json
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": [
    "github>shinGangan/renovate-config-hono" // [!code ++]
  ]
}
```

자세한 내용은 [renovate-config-hono](https://github.com/shinGangan/renovate-config-hono) 저장소를 참조하세요.
