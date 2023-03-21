import 'jest';

import {sameorigin, SameOriginRequestConfig} from '../src';

jest.setTimeout(60 * 1000);

const requestAndClose = async (squatURL: string, params: SameOriginRequestConfig) => {
  const [axios, {close}] = await sameorigin({
    squatURL,
  });

  const {data} = await axios(params);

  await close();

  return data;
};

describe('index.test.ts', () => {

  it('opensea:carousel', async () => {
    const data = await requestAndClose(
      'https://opensea.io',
      {
        baseURL: 'https://opensea.io/__api/graphql/',
        method: 'post',
        data: {
          id: 'CategoryCarouselQuery',
          query: 'query CategoryCarouselQuery {\n  categoriesV2 {\n    slug\n    imageUrl\n    name\n  }\n}\n',
          variables: {},
        },
      }
    );
    expect(data).toMatchSnapshot();
  });

  it('opensea:categories', async () => {
    const data = await requestAndClose(
      'https://opensea.io',
      {
        baseURL: 'https://opensea.io/__api/graphql/',
        method: 'post',
        headers: {
          'x-build-id': 'cabc82dc7526c67efa0a5d98ebe6fa3d6f5d9cd8',
          'x-app-id': 'opensea-web',
          'x-signed-query': '5adb01ca3055fd2902dac5828b0f40b66279604bb472c77709df8c369c62ebcc',
          'x-viewer-address': '0x9ce69a314330687f1fb1ad1d397a0bb55d5e1d22',
        },
        data: {
          id: "CategoryScrollerQuery",
          query: "query CategoryScrollerQuery(\n  $categories: [CategoryV2Slug!]!\n  $highQualityFilter: Boolean\n) {\n  trendingCollectionsByCategory(first: 7, categories: $categories, highQualityFilter: $highQualityFilter) {\n    edges {\n      node {\n        id\n        ...HomePageCollectionCard_data_3C7EJl\n      }\n    }\n  }\n}\n\nfragment HomePageCollectionCardFooter_data_3C7EJl on CollectionType {\n  windowCollectionStats(statsTimeWindow: ONE_DAY) {\n    floorPrice {\n      unit\n      symbol\n    }\n    volume {\n      unit\n      symbol\n    }\n  }\n}\n\nfragment HomePageCollectionCard_data_3C7EJl on CollectionType {\n  banner\n  name\n  verificationStatus\n  drop {\n    ...useDropState_data\n    id\n  }\n  ...HomePageCollectionCardFooter_data_3C7EJl\n  ...collection_url\n}\n\nfragment collection_url on CollectionType {\n  slug\n  isCategory\n}\n\nfragment useDropState_data on DropType {\n  stages {\n    startTime\n    endTime\n    id\n  }\n  chainData {\n    mintedItemCount\n    totalItemCount\n  }\n}\n",
          variables: {"categories":["photography"],"highQualityFilter":true},
        },
      }
    );
    expect(data).toMatchSnapshot();
  });

  it('blur', async () => {
    const data = await requestAndClose(
      'https://blur.io/airdrop',
      {
        baseURL: 'https://core-api.prod.blur.io/v1',
        url: '/prices',
        method: 'get',
      }
    );
    expect(data).toMatchSnapshot();
  });
});
