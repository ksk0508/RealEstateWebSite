# Deployment Notes

## Cloudflare Pages

The public website should be deployed as a Cloudflare Pages project connected to:

```text
GitHub repo: ksk0508/RealEstateWebSite
Branch: main
Build command: empty
Build output directory: /
Root directory: /
```

Every push to `main` should trigger a Pages deployment.

## Cloudflare Worker

The Worker is the project publish API:

```text
long-wave-e9fc
```

It receives updates from the admin modal and commits `projects.json` to GitHub.

Worker config lives in:

```text
wrangler.toml
```

Required plaintext variables:

```text
REPO_OWNER=ksk0508
REPO_NAME=RealEstateWebSite
BRANCH=main
FILE_PATH=projects.json
ALLOWED_ORIGIN=*
```

Required secrets:

```text
ADMIN_KEY
GITHUB_TOKEN
```

Set secrets with:

```powershell
npx wrangler secret put ADMIN_KEY
npx wrangler secret put GITHUB_TOKEN
```

Deploy Worker with:

```powershell
npx wrangler deploy
```

Verify secrets with:

```powershell
npx wrangler secret list
```

Expected:

```json
[
  { "name": "ADMIN_KEY", "type": "secret_text" },
  { "name": "GITHUB_TOKEN", "type": "secret_text" }
]
```

Never store `GITHUB_TOKEN` as a plaintext Cloudflare variable.

## GitHub Token Requirements

The GitHub token must have access to:

```text
ksk0508/RealEstateWebSite
```

Fine-grained PAT permissions:

```text
Contents: Read and write
Metadata: Read-only
```

Classic PAT scope for testing:

```text
repo
```

## Local Useful Commands

Validate JSON and Worker syntax:

```powershell
node -e "JSON.parse(require('fs').readFileSync('projects.json','utf8')); console.log('projects.json ok')"
node --check cloudflare-worker.js
```

Push website changes:

```powershell
git add .
git commit -m "Update website"
git push origin main
```
