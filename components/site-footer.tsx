export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div>
          <strong>Hono 한국어 문서</strong>
          <p>공식 Hono 문서를 한국어 정적 사이트로 제공하는 커뮤니티 미러입니다.</p>
        </div>
        <div className="site-footer__links">
          <a
            href="https://github.com/honojs/hono"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <a
            href="https://github.com/orgs/honojs/discussions"
            rel="noopener noreferrer"
            target="_blank"
          >
            토론
          </a>
          <a href="/llms.txt">LLM 문서</a>
        </div>
      </div>
    </footer>
  )
}
