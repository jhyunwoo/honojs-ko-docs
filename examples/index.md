<script setup>
import { data } from './menu.data.ts'
</script>

# 예

이 섹션에서는 Hono를 사용하여 애플리케이션을 생성하는 실제 예제를 볼 수 있습니다.

<div v-for="sections of data">
  <section v-for="category of sections">
    <h2>{{ category.text }}</h2>
    <ul v-for="item of category.items">
      <li><a :href="item.link">{{ item.text }}</a></li>
    </ul>
  </section>
</div>

## GitHub 저장소

GitHub 저장소: [Hono 예제](https://github.com/honojs/examples)에서 예제를 볼 수도 있습니다.
