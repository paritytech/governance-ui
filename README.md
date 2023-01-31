[![Netlify Status](https://api.netlify.com/api/v1/badges/cff5d1d2-69aa-42de-8204-38043bddecb8/deploy-status)](https://app.netlify.com/sites/stirring-alfajores-b573c7/deploys)
![CI status](https://github.com/jeluard/swipealot/actions/workflows/ci.yml/badge.svg)

Swipealot is a [PWA](https://web.dev/learn/pwa/) - or Progressive Web App - with a focus on efficiency and offline support in the context of [Web3](https://polkadot.network/).

# Development

## Testing

Unit tests can be run via `yarn test`.

Run end-to-end tests via the following steps:

```shell
# Setup
yarn
npx playwright install

# Run webapp in a dedicated tab
yarn dev

# Run chain in a dedicated tab
yarn zombienet:native

# Launch tests
URL=http://127.0.0.1:1234/?rpc=ws://127.0.0.1:9984 yarn test:e2e
``` 