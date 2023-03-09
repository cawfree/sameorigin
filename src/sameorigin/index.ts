import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

import {createServer} from '../server';

export type SameOriginRequestConfig =
  & AxiosRequestConfig
  & Required<
    Pick<AxiosRequestConfig, 'baseURL'>
  >;

export const sameorigin = async ({
  squatURL,
  port = 3000,
  ...extras
}: Parameters<typeof createServer>[0] & {
  readonly squatURL: string;
}) => {
  const opts = await createServer({port, ...extras});

  const {data: {id}} = await axios({
    url: `http://localhost:${port}/open`,
    method: 'post',
    data: {uri: squatURL},
  });

  return [
    <ResponseType>({
      url: maybeUrl,
      baseURL,
      ...extras
    }: SameOriginRequestConfig): Promise<AxiosResponse<ResponseType>> => axios({
      ...extras,
      url: `http://localhost:${
        port
      }/${
        id
      }?baseUrl=${
        encodeURIComponent(String(baseURL))
      }${
        maybeUrl?.length ? `&url=${encodeURIComponent(String(maybeUrl))}` : ''
      }`,
    }),
    opts,
  ] as const;
};

export type SameOrigin = Awaited<ReturnType<typeof sameorigin>>;
