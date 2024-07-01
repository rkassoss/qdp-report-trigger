# qdp-report-trigger

## Decsription

Simple Qlik button extension (nebula) to trigger a custom printing middleware. The middleware is a separate project (running separately on localhost:4000).
See index.js line 109:
https://localhost:4000/qlik-cloud-puppet?appId=${appId}&userId=${userId}&bookmarkId=${bookmarkId}

## Usage

Start the nebula dev server
```js
npm start
```

Package the Qlik extension (to install later via QMC)
```js
npm sense
```

