KOREAN LEARNING PORTAL — GITHUB PAGES FIX

This package is designed for GitHub Pages using Settings > Pages > Deploy from a branch. It does NOT require GitHub Actions.

UPLOAD THESE FOUR FILES to the exact folder selected in GitHub Pages (usually the repository root):
- index.html
- app.js
- style.css
- korea.json

KEEP your existing culture.json and daily_vocabulary.json in that same folder. They are optional for the main course. If either is missing, the main portal still loads and only that optional section shows a reminder.

IMPORTANT:
1. Keep filenames lowercase and exactly as shown.
2. Do not upload the ZIP itself as the website. Extract it first.
3. In Settings > Pages, choose Deploy from a branch, then select the branch and folder containing index.html.
4. Wait for Pages to publish, then hard-refresh the site with Ctrl+Shift+R.
5. Do not add a deploy.yml workflow; this package is for Deploy from a branch.

Color coding is applied only to Korean passages and conversation text. Vocabulary cards remain unchanged.
