# Concrete Vault Explorer

Concrete Vault Explorer is an independent, lightweight web application for browsing live Concrete vault data. It uses the [`@concrete-xyz/sdk`](https://www.npmjs.com/package/@concrete-xyz/sdk) through a small Express server and a framework-free HTML, CSS, and JavaScript frontend.

This is a community project and is not an official Concrete product.

## Features

- Live Concrete vault data loaded automatically
- Search by vault name or underlying asset
- Active and All vault views
- Chain filtering
- TVL and APY sorting, with unavailable APY values kept at the bottom
- Featured vault priority based on the current Concrete Earn selection
- Individual vault details, including asset, chain, address, TVL, APY, symbol, and other available live fields
- Loading, error, and retry states

## Active vault classification

The default Active view uses provisional data signals. A vault is included when:

- TVL is greater than zero
- APY is available and is not the unavailable sentinel value
- Its name and symbol do not contain an explicit standalone `test` marker

This is an explorer-specific filter. It is **not** an official Concrete production, approval, or safety classification.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology

- Vanilla HTML, CSS, and JavaScript
- Express
- `@concrete-xyz/sdk`
