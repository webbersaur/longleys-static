# longleysct.com

Static site for Longley's Restaurant & Bar, Branford CT. No build step - plain HTML/CSS/JS served as-is.

## Deploys

Pushing to `main` auto-deploys to the Vercel project **`longleys-static`** (production domain `longleysct.com`).

Check that a push actually deployed - a bad `vercel.json` fails the build while the previous deployment keeps serving, so the site looks fine but your change is not live:

```
vercel ls longleys-static
```

## vercel.json

`vercel.json` is validated against a strict schema. **Unknown keys fail the build**, so do not add comment keys such as `_comment` - there is no way to leave a comment in this file.

Routing is `cleanUrls` + `trailingSlash`, so each page lives at `folder/index.html` and is served at `/folder/`. Redirect `source` values need the trailing slash, because trailing-slash normalization runs first.

The `redirects` array holds permanent redirects for the legacy WordPress URLs that have no equivalent on this site.

## www redirect

`www.longleysct.com` -> `longleysct.com` (308) is configured at the **Vercel domain level**, not in `vercel.json`:

Vercel dashboard -> Project -> Domains -> `www.longleysct.com` -> redirect to `longleysct.com`.

A host-based redirect in `vercel.json` silently never fires, because domain-level redirects are evaluated before `vercel.json` routing.

## DNS

DNS is managed at **NameSilo** (`ns1/ns2/ns3.dnsowl.com`):

- apex `A` -> `216.150.1.1`
- `www` `CNAME` -> the project's `*.vercel-dns-016.com` target

**Do not move the nameservers to Vercel.** The zone holds the Resend/Amazon SES records that send the newsletter (`send` MX, `send` SPF, `resend._domainkey` DKIM); moving them breaks email.

## Structured data

Every page carries JSON-LD. The homepage defines the canonical `Restaurant` node at `https://longleysct.com/#restaurant`; landing pages reference it by `@id` so the whole site resolves to one business entity.

## Writing conventions

No em dashes or en dashes anywhere in content - use hyphens. They cause encoding gremlins and are the house style.
