import puppeteer from "puppeteer";

export async function scrapePage(url: string) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });
    const content = await page.evaluate(() => {
      document
        .querySelectorAll("script, style, nav, footer, header, noscript")
        .forEach((el) => el.remove());
      return {
        title: document.title,
        text: document.body.innerText.replace(/\s+/g, " ").trim(),
      };
    });
    await page.close();
    return content;
  } catch (error) {
    console.error(`Error scraping page ${url}:`, error);
    return null;
  } finally {
    await browser.close();
  }
}
