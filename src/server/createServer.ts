import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {nanoid} from 'nanoid';

import {proxyRequest, proxyRequestBody} from '../proxy';
import {createPageWithSniffedRequests, createStealthBrowserContext} from '../puppeteer';

type PageContext = Awaited<
  ReturnType<typeof createPageWithSniffedRequests>
>;

export const createServer = async ({
  port = 3000,
  headless = true,
  debug = false,
  executablePath = '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',
  args = [],
}: {
  readonly port?: number;
  readonly headless?: boolean;
  readonly debug?: boolean;
  readonly executablePath?: string;
  readonly args?: readonly string[];
}) => new Promise<{
    readonly close: () => Promise<void>;
}>(
  async (resolve) => {
    const {
      browserContext,
      close: closeBrowser,
    } = await createStealthBrowserContext({
      headless,
      debug,
      executablePath,
      args,
    });

    const context: Record<string, PageContext> = {};

    const server = express()
      .use(bodyParser.json())
      .use(cors())
      .use('/open', async (req, res, next) => {
        try {
          const {uri} = req.body;
          const id = nanoid();

          if (typeof uri !== 'string' || !uri.length)
            throw new Error(`Expected non-empty string "uri", encountered "${uri}".`);

          const pageContext = await createPageWithSniffedRequests({
            browserContext,
            url: uri,
          });

          Object.assign(context, {[id]: pageContext});

          return res.status(200).send({id});
        } catch (e) {
          next(e);
        }
      })
      .use('/close', async (req, res, next) => {
        try {
          const {id} = req.body;

          const {[id]: maybePageContext} = context;

          if (!maybePageContext) throw new Error(`Unable to find page with id "${id}".`);

          const {page} = maybePageContext;

          await page.close();

          delete context[id];

          return res.status(200).send({});
        } catch (e) {
          next(e);
        }
      })
      .use('/:id', async (req, res, next) => {
        try {
          const id = req.params.id;
          const baseUrl = req.query.baseUrl;
          const url = req?.query.url;

          const {[id]: maybePageContext} = context;

          if (!maybePageContext) throw new Error(`Unable to find page with id "${id}".`);

          if (typeof baseUrl !== 'string' || !baseUrl.length)
            throw new Error(`Expected baseUrl, encountered "${baseUrl}".`);

          const {page, sniffedRequests} = maybePageContext;

          const maybeMatchingRequest = sniffedRequests.find(e => e.url().startsWith(baseUrl));

          if (!maybeMatchingRequest)
            throw new Error(`Unable to find matching request for baseUrl "${baseUrl}".`);

          const {headers: customHeaders, body} = req;

          const origHeaders = maybeMatchingRequest.headers();

          const disableBodyMethods = ['get', 'head'];

          const args = proxyRequestBody({
            body: !disableBodyMethods.includes(req.method.toLowerCase()) ? JSON.stringify({...body}) : undefined,
            url: `${baseUrl}${typeof url === 'string' ? url : ''}`,
            // @ts-expect-error undefined
            headers: {...origHeaders, ...customHeaders},
            method: req.method,
          });

          const {text, headers} = await proxyRequest({
            page,
            args,
          });

          const {'content-type': contentType} = headers;

          return res
            .status(200)
            .send(contentType === 'application/json' ? JSON.parse(text) : text);
        } catch (e) {
          next(e);
        }
      })
      .listen(port, () => resolve({
        close: async () => {
          await Promise.all([
            new Promise(resolve => server.close(resolve)),
            closeBrowser(),
          ])
        },
      }));
  },
);
