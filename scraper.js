const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { PuppeteerScreenRecorder } = require("puppeteer-screen-recorder"); // <-- ADD THIS

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    slowMo: 100,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 🎥 Initialize the recorder
  const recorder = new PuppeteerScreenRecorder(page);
  await recorder.start("./scraping-session.mp4"); // File path where video is saved

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  await page.goto("https://quotes.toscrape.com/", {
    waitUntil: "networkidle2",
  });

  const quotes = await page.evaluate(() => {
    const data = [];
    const quoteElements = document.querySelectorAll(".quote");

    quoteElements.forEach((el) => {
      data.push({
        text: el.querySelector(".text")?.innerText,
        author: el.querySelector(".author")?.innerText,
        tags: Array.from(el.querySelectorAll(".tags .tag")).map(
          (tag) => tag.innerText
        ),
      });
    });

    return data;
  });

  console.log("📋 Scraped Quotes:", quotes);

  // ⏹️ Stop recording and close browser
  await recorder.stop();
  await browser.close();
})();
