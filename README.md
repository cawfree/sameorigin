## `sameorigin`
🤖 🧪 Masquerade as if you were their own frontend.

[`sameorigin`](https://github.com/cawfree/sameorigin) generalizes the process of [__Same-Origin-Resource-Crossing__](https://github.com/cawfree/opensea-submarine), which allows you to work around the domain-based restrictions centralized services use to protect their APIs from third parties.

###  🚀 Getting Started

You can install [`sameorigin`](https://github.com/cawfree/sameorigin) via [`yarn`](https://yarnpkg.com):

```shell
yarn add sameorigin
```

Next, declare the domain you wish to squat on. In the following example, let's assume I want to bypass the [__CloudFlare__](https://www.cloudflare.com/) restrictions on the [__Blur Marketplace__](https://blur.io/):


```typescript
const [axios, {close}] = await sameorigin({
  // Define the website url that has access permissions.
  squatURL: 'https://blur.io',
});

const {data} = await axios({
  // Important! You must declare the baseURL of the API you intend
  // to target. This is because it is used to isolate requests you
  // intend to hijack for your own purposes.
  baseURL: 'https://core-api.prod.blur.io/v1',
    
  // GET https://core-api.prod.blur.io/v1/prices
  url: '/prices',
  method: 'get',
});

// Once finished, you'll need to close your client to prevent
// memory leaks.
await close();
```

### 🤔 How does it work?

When making a call to [`sameorigin`](https://github.com/cawfree/sameorigin), we allocate an instance of [`puppeteer`](https://github.com/puppeteer/puppeteer) in the background which is used to capture requests and serve as a trusted origin for API requests to originate from.

We make the page available via an [`express`](https://expressjs.com/) server which manages the life cycle of pages, captures requests which satisfy CloudFlare's protections and dynamically inject them with custom query data.

This process is masked behind the returned [`axios`](https://github.com/axios/axios) client. The underlying process of squatting on pages, hijacking requests and returning the data as if it were a conventional fetch request are abstracted away from the caller.

### ✌️ License
[__CC0-1.0__](./LICENSE)

