# Security Best Practices Report

## Summary
- Reviewed the deployed-scope Next.js static export site on 2026-03-13.
- No critical or high-severity issues were found in the current repository scope.
- Two medium/low hardening issues were identified and fixed in this pass.

## Fixed During This Pass
1. JSON-LD script serialization hardening
- File: `components/structured-data.tsx`
- Risk: Raw `JSON.stringify(...)` inside `dangerouslySetInnerHTML` could allow `</script>` style content breaks if a content-derived field ever contained unsafe characters.
- Fix: Added HTML-safe escaping for `<`, `>`, `&`, `U+2028`, and `U+2029` before injection.

2. External link hardening
- Files: `components/site-header.tsx`, `app/examples/[[...slug]]/page.tsx`, existing footer links already matched
- Risk: Some `target="_blank"` links did not include `noopener`.
- Fix: Standardized on `rel="noopener noreferrer"`.

3. Static-host header policy
- File: `public/_headers`
- Risk: Static export apps rely on the CDN/host for response headers; there was no checked-in policy file.
- Fix: Added deploy-time guidance for `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and cache behavior for HTML, immutable assets, and search/index text files.

4. Production delivery hardening
- File: `next.config.mjs`
- Fix: Confirmed `poweredByHeader: false` and `productionBrowserSourceMaps: false`.

5. Unsafe href handling in MDX links
- File: `components/mdx-components.tsx`
- Fix: Limited allowed href schemes and fall back to `#` for unsafe values.

## Residual Deployment Checks
1. Verify the production host actually honors `public/_headers`.
- For example, Cloudflare Pages and Netlify can apply these rules, but behavior depends on platform configuration.

2. Set `NEXT_PUBLIC_SITE_URL` to the real production domain before the deployment build.
- This is required for correct canonical URLs, sitemap entries, Open Graph URLs, and robots behavior.

3. Confirm preview/staging URLs are intentionally public.
- The app itself has no auth layer, so access control is purely a deployment concern.

4. If a CSP is added later, validate it carefully against Next static output and JSON-LD scripts.
- A strict CSP can improve defense in depth, but it should be tested rather than guessed.

## Review Scope Notes
- This repository is a static documentation site with no login flow, user-generated content pipeline, or secret-handling backend in the reviewed code path.
- Because of that architecture, the largest real risks are deployment misconfiguration, unsafe script serialization, and missing response headers rather than server-side auth/session bugs.
