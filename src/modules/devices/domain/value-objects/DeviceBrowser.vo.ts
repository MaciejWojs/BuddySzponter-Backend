export class DeviceBrowser {
  private readonly browser: string;

  constructor(browser: string) {
    if (!browser || browser.trim() === '') {
      throw new Error('Device browser cannot be empty');
    }
    this.browser = browser;
  }

  get value(): string {
    return this.browser;
  }
}
