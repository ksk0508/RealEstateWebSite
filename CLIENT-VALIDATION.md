# Client Validation Checklist

Use this checklist to validate the Clarity Estates website after deployment.

## 1. Public Website

Open:

```text
https://<pages-site-url>/?v=client-test
```

Confirm:

- Page loads successfully.
- Header, hero, project, founder, contact, and footer sections display correctly.
- Text is readable and has no corrupted characters such as `Ã`, `Â`, or odd symbols.
- Contact section text is visible in both light and dark theme.
- WhatsApp floating button appears at the bottom right.

## 2. Projects

Confirm:

- Projects section displays the expected project cards.
- Project images load.
- Project tags show location, configuration, price, and status.
- **Request Details** opens WhatsApp with a prefilled message.

## 3. Admin Access

Open:

```text
https://<pages-site-url>/?admin=true
```

Use the admin key shared separately.

Confirm admin modal has:

- Add
- Apply Changes
- Delete
- Duplicate
- Export JSON
- Import JSON
- Bulk CSV
- CSV Template
- Publish Projects

## 4. Single Project Edit Test

1. Duplicate an existing project.
2. Change the title to `Validation Test Project`.
3. Click **Apply Changes**.
4. Confirm the card appears on the page preview.
5. Click **Publish Projects**.
6. Wait for reload/deployment.
7. Confirm the project appears on the public page.

After validation, delete the test project and publish again.

## 5. Bulk CSV Test

1. Click **CSV Template**.
2. Open the downloaded CSV.
3. Add one test project row.
4. Click **Bulk CSV**.
5. Select the CSV.
6. Choose **Cancel** when asked, so it appends instead of replacing all projects.
7. Confirm the imported project appears in admin preview.
8. Publish.
9. Confirm it appears on the public site.

After validation, delete the test project and publish again.

## 6. Image Test

Preferred test:

- Paste a public image URL into the image field.
- Apply and publish.
- Confirm the image loads on the public site.

Fallback test:

- Upload a small image under 700 KB using the admin upload field.
- Apply and publish.
- Confirm image loads.

For production, use hosted image URLs instead of base64 uploads when possible.

## 7. Expected Publish Flow

When **Publish Projects** is clicked:

1. Cloudflare Worker validates the admin key.
2. Worker commits `projects.json` to GitHub.
3. Cloudflare Pages redeploys from GitHub.
4. Public site reloads with updated projects.

If an update does not show immediately, open:

```text
https://<pages-site-url>/?v=<new-random-value>
```

## 8. Do Not Share

Do not share these in screenshots or documents:

- Admin key
- GitHub PAT/token
- Cloudflare login/session
- Any secret values
