import {Page, SerializableOrJSHandle} from 'puppeteer-core';

export const proxyRequest = ({page, args}: {
  readonly page: Page;
  readonly args: SerializableOrJSHandle;
}) => page.evaluate(
  async ({body, url, headers, method}) => {
    const response = await fetch(url, {headers, body, method});
    const text = await response.text();

    const entries: [string, string][] = [];

    response.headers.forEach((v, k) => entries.push([k.toLowerCase(), v]));

    return {
      text,
      headers: Object.fromEntries(entries),
    };
  },
  args,
);
