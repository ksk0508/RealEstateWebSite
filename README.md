# Clarity Estates Website

Static real estate website for Clarity Estates, hosted on Cloudflare Pages with a Cloudflare Worker used only for authenticated project updates.

## Public Website

Open the Cloudflare Pages URL shared by the project owner. The public site loads project data from:

```text
projects.json
```

The Projects section should show all active projects from that file.

## Admin Project Manager

Open the site with:

```text
https://<pages-site-url>/?admin=true
```

Enter the admin publish key provided separately by the project owner. Do not share the key in email, documents, screenshots, or public tickets.

Admin can:

- Add a single project
- Edit project details
- Delete a project
- Duplicate a project
- Import/export JSON
- Bulk import projects from CSV
- Publish updates to GitHub through the Cloudflare Worker

After publishing, GitHub `projects.json` is updated and Cloudflare Pages redeploys the site.

## Bulk CSV Upload

Use **CSV Template** in the admin modal to download a sample file.

Required CSV columns:

```text
title,location,bhk,price,status,image,whatsapp,description,bullets
```

Example row:

```csv
Aparna One,Shaikpet,3 & 4 BHK,Rs 5 Cr - Rs 8 Cr,Ready to Move,https://example.com/aparna-one.jpg,919948091645,Premium residential project,"Highlight 1 | Highlight 2 | Highlight 3"
```

Notes:

- `image` should usually be a public image URL.
- `whatsapp` is optional. If empty, the site uses the default WhatsApp number.
- `bullets` can contain multiple highlights separated by `|`.
- During import:
  - OK replaces all projects.
  - Cancel appends imported projects to the existing list.
- Click **Publish Projects** after reviewing the imported projects.

## WhatsApp Enquiries

Each project card has a **Request Details** button. It opens WhatsApp with a prefilled enquiry message.

If a project has its own `whatsapp` number, that number is used. Otherwise the default client number is used.

## Images

Recommended approaches:

1. Public image URL from reliable hosting.
2. Static images in this repo, for example:

```text
assets/projects/project-name.jpg
```

Then use:

```text
/assets/projects/project-name.jpg
```

3. Cloudflare R2 for frequent image uploads or larger image libraries.

The admin also supports small image upload as a fallback. It stores the image inside `projects.json` as base64. Keep those images below 700 KB and avoid using this for many projects.

## Deployment Model

- Website: Cloudflare Pages
- Admin update API: Cloudflare Worker
- Source of project data: GitHub `projects.json`
- Repo: `ksk0508/RealEstateWebSite`
- Branch: `main`

Cloudflare Pages should auto-deploy when the GitHub repo changes.

## Security

Never share:

- Admin publish key
- GitHub personal access token
- Cloudflare account credentials

The Worker requires these secrets/config values:

Secrets:

```text
ADMIN_KEY
GITHUB_TOKEN
```

Plaintext Worker variables:

```text
REPO_OWNER=ksk0508
REPO_NAME=RealEstateWebSite
BRANCH=main
FILE_PATH=projects.json
ALLOWED_ORIGIN=*
```

`GITHUB_TOKEN` must be a Worker secret, not a plaintext variable.
