---
title: Hono - 웹 표준을 기반으로 구축된 웹 프레임워크
titleTemplate: ':title'
head:
  - [
      'meta',
      {
        property: 'og:description',
        content: "'Hono'는 웹 표준을 기반으로 구축된 작고 단순하며 초고속 웹 프레임워크입니다. Cloudflare Workers, Fastly Compute, Deno, Bun, Vercel, Netlify, AWS Lambda, Lambda@Edge 및 Node.js에서 작동합니다. 빠르지만 빠르기만 한 것은 아닙니다.",
      },
    ]
layout: home
hero:
  name: Hono
  text: 웹 애플리케이션 프레임워크
  tagline: 빠르고 가벼우며 웹 표준을 기반으로 구축되었습니다. 모든 JavaScript 런타임을 지원합니다.
  image:
    src: /images/code.webp
    alt: "Hono의 코드 예입니다. \
      Hono \
      const app = new Hono() \
      app.get('/', (c) => c.text('Hello Hono!')) \

      export default app"
  actions:
    - theme: brand
      text: 시작하기
      link: /docs/
    - theme: alt
      text: GitHub에서 보기
      link: https://github.com/honojs/hono
features:
  - icon: 🚀
    title: 초고속 및 경량
    details: 라우터 RegExpRouter는 정말 빠릅니다. hono/tiny 사전 설정은 14kB 미만입니다. 웹 표준 API만 사용합니다.
  - icon: 🌍
    title: 다중 런타임
    details: Cloudflare, Fastly, Deno, Bun, AWS 또는 Node.js에서 작동합니다. 모든 플랫폼에서 동일한 코드가 실행됩니다.
  - icon: 🔋
    title: 배터리 포함
    details: Hono에는 기본 제공 미들웨어, 사용자 정의 미들웨어, 타사 미들웨어 및 도우미가 있습니다. 배터리가 포함되어 있습니다.
  - icon: 😃
    title: 유쾌한 DX
    details: 매우 깨끗한 API. 일류 TypeScript 지원. 이제 "유형"이 있습니다.
---

<script setup>
// React에서 많은 영감을 받음
// https://github.com/reactjs/react.dev/pull/6817
import { onMounted } from 'vue'
onMounted(() => {
  var preferredKawaii
  try {
    preferredKawaii = localStorage.getItem('kawaii')
  } catch (err) {}
  const urlParams = new URLSearchParams(window.location.search)
  const kawaii = urlParams.get('kawaii')
  const setKawaii = () => {
    const images = document.querySelectorAll('.VPImage.image-src')
    images.forEach((img) => {
      img.src = '/images/hono-kawaii.png'
      img.alt = 'A Kawai Version of the Hono Logo. The first "o" is replaced with a flame, with japanese characters in the bottom right, and a JSX fragment closing tag above the flame.'
      img.classList.add("kawaii")
    })
  }
  if (kawaii === 'true') {
    try {
      localStorage.setItem('kawaii', true)
    } catch (err) {}
    console.log('kawaii mode enabled. logo credits to @sawaratsuki1004 via https://github.com/SAWARATSUKI/KawaiiLogos');
    setKawaii()
  } else if (kawaii === 'false') {
    try {
      localStorage.removeItem('kawaii', false)
    } catch (err) {}
    const images = document.querySelectorAll('.VPImage.image-src')
    images.forEach((img) => {
      img.src = '/images/code.webp'
      img.classList.remove("kawaii")
    })
  } else if (preferredKawaii) {
    setKawaii()
  }
})
</script>
