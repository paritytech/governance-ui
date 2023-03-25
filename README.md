![CI status](https://github.com/paritytech/governance-ui/actions/workflows/ci.yml/badge.svg)
![CT status](https://github.com/paritytech/governance-ui/actions/workflows/ct.yml/badge.svg)

Governance UI is a [PWA](https://web.dev/learn/pwa/) - or Progressive Web App - with a focus on efficiency and offline support in the context of [Web3](https://polkadot.network/).

As a pure web application, it doesn't depend on remote backend to operate but connects to [Polkadot](https://polkadot.network/) nodes.
Some data will be fetched to enhance the experience from `github.com` and `polkassembly.io/`, although the plan short term is to become fully decentralized.

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

The full website can be started using `PUBLIC_URL=https://... yarn build` where `PUBLIC_URL` is the final root URL for the considered deplyment environment.

# Development

A local dev environment can be started using `yarn dev`.

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
