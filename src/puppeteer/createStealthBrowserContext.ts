import puppeteer from 'puppeteer-extra';
import {Browser} from 'puppeteer-core';
import stealth from 'puppeteer-extra-plugin-stealth';

export async function createStealthBrowserContext({
  executablePath,
  headless,
  debug: dumpio = false,
  args,
}: {
  readonly executablePath: string;
  readonly headless: boolean;
  readonly debug?: boolean;
  readonly args: readonly string[];
}) {
  puppeteer.use(stealth());

  const browser = (
    await puppeteer.launch({
      executablePath,
      headless,
      devtools: false,
      dumpio,
      args: [
        '--hide-scrollbars',
        '--mute-audio',
        '--disable-dev-shm-usage',
        ...args,
      ],
    })
  ) as unknown as Browser;

  return {
    browserContext: await browser.createIncognitoBrowserContext(),
    close: () => browser.close(),
  };
}
