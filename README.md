# hladaci-scoreboard

Static scoreboard page for "guessing" games (GeoGuessr and the like). The page reads
all its data from a single typed file, [src/scores.ts](src/scores.ts).

## Development

Requires Node 22 (`nvm use`) and Yarn. The Yarn version (4.x) is pinned in the repo via `yarnPath`, so any global `yarn` works.

```sh
yarn install
yarn dev          # dev server
yarn build        # type-check + production build into dist/
yarn preview      # serve the production build
yarn lint
yarn test         # unit tests (ranking logic)
```

## Deployment

Every push to `main` builds the site and deploys it to GitHub Pages via
[.github/workflows/deploy.yml](.github/workflows/deploy.yml). In the repository settings,
set **Pages → Build and deployment → Source** to **GitHub Actions**.
