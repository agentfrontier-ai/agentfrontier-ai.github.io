# Agent Frontier

The Agent Frontier website: plain HTML, CSS and JavaScript, with no build step and no dependencies.
GitHub Pages serves this repository as it is.

## Pages

| Address | File |
|---|---|
| `/` | `index.html` |
| `/news/` | `news/index.html` |
| `/blog/` | `blog/index.html` |
| `/team/` | `team/index.html` |
| `/contact/` | `contact/index.html` |

Styles are in `assets/site.css`, the drawings and interactions in `assets/site.js`, images in `assets/`.
Every page carries the same header, footer and all five page bodies; the one that belongs to the
address is shown and the others are hidden, so a change to the header or footer has to be made in each file.

## Preview on your own machine

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/.

## Things to fill in

- Blog has no posts yet.
- X and LinkedIn links are left out until there are accounts to point to.
- The contact page lists Discord and GitHub; add an email address when there is one.
- LiveWorldArena and FrontierPro link to their current pages; change the links when their own sites are up.

Avatar illustrations and organisation marks belong to their owners.
