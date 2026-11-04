# My Money

A private, customizable money tracker that runs entirely in the browser. Anyone can open the site, and each person's data stays in **their own browser**. Nothing is ever uploaded, so data is never shared or mixed between people.

## Features

- **Month view:** how much is left this month, a daily allowance, spent vs. set aside, and extra income
- **Buckets:** PEA, savings, badminton… or your own, each with an optional goal and progress bar
- **Spending:** a donut chart plus per-category budgets with warnings when you're near or over budget
- **History:** search, filter by type, tap to edit, delete with undo
- **Quick-add buttons** and **monthly repeats** (rent, subscriptions…)
- **Year view:** money in vs. out, bucket growth, saving rate, top categories
- **Profiles:** several people can share one device, each with a separate space and an optional PIN
- **Customization:** theme (auto/light/dark), any accent colour, font, corner style, currency, buckets and categories
- **Privacy:** a "hide amounts" blur mode
- **Your data:** JSON backup and restore, CSV export, and CSV import (including the old "Copy all data as CSV" format)
- **Works offline** and can be installed to the home screen (PWA)

## Hosting (GitHub Pages)

1. Merge into `main`.
2. In the repository go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. The `Deploy site to GitHub Pages` workflow publishes the site at `https://<user>.github.io/<repo>/`.

It is a plain static site (`index.html`, `app.js`, `styles.css`), so any static host works too (Netlify, Cloudflare Pages, Vercel…).

## Local development

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Privacy note

Data is stored in `localStorage` under per-profile keys (`mm:data:<id>`). A PIN keeps other people on the same device out of a profile. It does not encrypt the data. Because nothing is stored on a server, your data doesn't sync between devices; use **Settings → Download backup / Restore** to move it.
