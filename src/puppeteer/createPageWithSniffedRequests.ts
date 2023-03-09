import {BrowserContext, HTTPRequest, Page} from 'puppeteer-core';

export const createSniffer = async ({
  page,
  max,
  timeout,
}: {
  readonly page: Page;
  readonly max: number;
  readonly timeout: number;
}): Promise<readonly HTTPRequest[]> => {
  const httpRequests: HTTPRequest[] = [];

  const start = Date.now();

  const canPushRequests = () => httpRequests.length < max && Date.now() - timeout < start;

  return new Promise<readonly HTTPRequest[]>(
    (resolve, reject) => {
      if (typeof timeout === 'number') {

        setTimeout(
          () => {
            if (httpRequests.length) {
              resolve([...httpRequests]);
            } else {
              reject(new Error('Unable to determine GraphQLRequests.'));
            }
          },
          timeout
        );
      }

      page.on('request', (request: HTTPRequest) => {

        if (canPushRequests()) httpRequests.push(request)

        if (httpRequests.length === max) resolve([...httpRequests]);

        request.continue();
      });
    },
  );
};

export const createPageWithSniffedRequests = async ({
  browserContext,
  url,
  max = Number.MAX_SAFE_INTEGER,
  timeout = 5 * 1000,
}: {
  readonly browserContext: BrowserContext;
  readonly url: string;
  readonly max?: number;
  readonly timeout?: number;
}) => {
  const page = await browserContext.newPage();

  const sniffer = createSniffer({
    page,
    timeout,
    max,
  });

  await page.setCacheEnabled(false);
  await page.setRequestInterception(true);

  await page.goto(url);

  return {page, sniffedRequests: [...await sniffer]};
}
