# NovaCart — Full-Stack Deployment & Project Architecture Capstone

NovaCart is a production-ready e-commerce product catalog built as a Web Development Capstone Project.

It is a static frontend SPA, so it can be deployed directly to GitHub Pages, Netlify, Vercel, or Render without any build step.

## Implemented Capstone Requirements

### Modular frontend application

The JavaScript is split into focused modules:

```txt
assets/js/app.js
assets/js/modules/products.js
assets/js/modules/router.js
assets/js/modules/state.js
assets/js/modules/store.js
assets/js/modules/utils.js
assets/js/modules/views.js
```

### Client-side routing

Implemented hash-based SPA routing:

```txt
#/
#/products
#/products/:id
#/cart
#/about
```

Hash routing works reliably on GitHub Pages, Netlify, Vercel, and Render.

### E-commerce product catalog

Implemented:

- Product listing
- Product detail pages
- Search
- Category filter
- Sorting
- Add to cart
- Increment/decrement quantity
- Remove item
- Clear cart
- Cart totals
- localStorage cart persistence

### Optimized assets

- Product images are lightweight SVG files.
- Images use `loading="lazy"` and `decoding="async"`.
- Static deployment cache headers included for `/assets/*`.
- Minified CSS and JS copies are included.
- No framework bundle, no unnecessary dependencies.

### Deployment-ready configuration

Included:

```txt
netlify.toml
_redirects
vercel.json
render.yaml
package.json
robots.txt
sitemap.xml
```

## File Structure

```txt
index.html
assets/
  css/
    styles.css
    styles.min.css
  img/
    audio-pods.svg
    desk-lamp.svg
    laptop-pro.svg
    mechanical-keyboard.svg
    smart-watch.svg
    travel-backpack.svg
    usb-c-hub.svg
    wireless-mouse.svg
  js/
    app.js
    app.min.js
    modules/
      products.js
      products.min.js
      router.js
      router.min.js
      state.js
      state.min.js
      store.js
      store.min.js
      utils.js
      utils.min.js
      views.js
      views.min.js
netlify.toml
_redirects
vercel.json
render.yaml
package.json
README.md
robots.txt
sitemap.xml
```

## How to Upload

Upload the entire extracted project to a new GitHub repository.

The root of your repo must directly contain:

```txt
index.html
assets/
README.md
netlify.toml
vercel.json
render.yaml
package.json
```

Do not place these inside an extra folder.

## Deployment

### GitHub Pages

Settings → Pages → Deploy from branch → main → root.

### Netlify

Drag and drop the project folder, or connect the GitHub repo. The included `netlify.toml` handles static publishing.

### Vercel

Import the GitHub repo into Vercel. The included `vercel.json` handles SPA rewrites and asset caching.

### Render

Create a Static Site and connect the repo. The included `render.yaml` documents the static site configuration.

## Notes

The placeholder `https://example.com/` is present only in SEO files. Replace it with your final deployed URL after deployment for best SEO polish.

The app itself works without replacing it.
