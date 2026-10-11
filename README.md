# Pick'UR'Pixel: Coming soon page

A single-file static page (`index.html`). No build step and no dependencies, so it works on GitHub Pages as is.

## Launch on GitHub Pages

1. Create a new repository on GitHub (for a custom domain or `username.github.io`, name it `username.github.io`).
2. Upload `index.html` and `README.md` to the root of the repository (Add file > Upload files).
3. Go to **Settings > Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then **Save**.
4. After a minute or two the site is live at `https://username.github.io/repository-name/`.

### Custom domain (optional)
In **Settings > Pages > Custom domain**, enter your domain (for example `pickurpixel.com`) and tick **Enforce HTTPS**. Then add the DNS records GitHub lists at your domain registrar.

## Things to edit in `index.html`

| What | Where |
|---|---|
| Launch date and time | `LAUNCH_DATE` near the top of the script (ISO format with timezone) |
| Email sign-ups | Replace `YOUR_FORM_ID` in the form `action` with your [Formspree](https://formspree.io) form ID (free plan available) |
| Social and contact links | The `<footer>` list: replace each `#` and `hello@yourdomain.com` |
| Share preview image | Uncomment the `og:image` tag and point it to a 1200x630 image in the repo |
| Colours | The `:root` variables at the top of the `<style>` block |

GitHub Pages is static, so it can't store emails itself. Formspree (or a similar form service) receives the sign-ups and emails them to you.

## When you're ready to launch the real site
Replace `index.html` with the new site, or delete this file and push the new site's files.
