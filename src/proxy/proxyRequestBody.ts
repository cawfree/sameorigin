import {JSONObject} from 'puppeteer-core';

export const proxyRequestBody = ({method, url, body, headers = {}}: {
  readonly method: string;
  readonly url: string;
  readonly body?: Record<string, unknown> | string;
  readonly headers?: Record<string, string | string[]>;
}) => ({
  method,
  url,
  headers,
  body,
} as JSONObject);
