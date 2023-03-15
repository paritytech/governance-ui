![CI status](https://github.com/jeluard/governance-ui/actions/workflows/ci.yml/badge.svg)
![CT status](https://github.com/jeluard/governance-ui/actions/workflows/ct.yml/badge.svg)

Governance UI is a [PWA](https://web.dev/learn/pwa/) - or Progressive Web App - with a focus on efficiency and offline support in the context of [Web3](https://polkadot.network/).

# Use

## Register as a delegate

Anyone can register themselves as a delegate.

To add a new delegate, edit [this file](assets/data/polkadot/delegates.json).

The following table outlines the structure of a `delegate` entry:

| Element          | Key          | Required | Notes                                                                                       |
| ---------------- | ------------ | -------- | ------------------------------------------------------------------------------------------- |
| Delegate Name    | `name`       | Yes      | The chosen name of the delegate.                                                            |
| Delegate Address | `address`    | Yes      | The chain address of the delegate.                                                          |
| Manifesto        | `manifesto`  | Yes      | A description of your goals as a delegate. Supports markdown.                               | 
# Build

A local dev environment can be started using `yarn dev`. The full website can be started using `yarn build`.

# Development

## Testing

Unit tests can be run via `yarn test:unit`.

Run end-to-end tests via the following steps:

```shell
# Setup
yarn
npx playwright install

# Run webapp in a dedicated tab
yarn dev

cd test/

# Run chain in a dedicated tab
yarn zombienet:native

# Launch tests
URL=http://127.0.0.1:1234/?rpc=ws://127.0.0.1:9984 yarn test:e2e
``` 
