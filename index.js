import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-zygote",
    "--single-process",
    "--no-first-run",
    "--window-size=1920x1080",
  ],
  executablePath:
    process.env.NODE_ENV === "production"
      ? "/usr/bin/google-chrome"
      : undefined,
});


const scrapePage = async (url, callback) => {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    const content = await page.content();
    const result = await callback(content);
    await browser.close();
    return result;
  } catch (err) {
    console.error(`❌ Failed to scrape ${url}:`, err.message);
    await browser.close();
    return [];
  }
};

import * as cheerio from "cheerio";

const scrapeStartech = async (query) =>
  scrapePage(
    `https://www.startech.com.bd/product/search?search=${encodeURIComponent(
      query
    )}`,
    (html) => {
      const $ = cheerio.load(html);
      const products = [];
      $(".p-item").each((_, el) => {
        const name = $(el).find(".p-item-name a").text().trim();
        const link = $(el).find(".p-item-name a").attr("href");
        const image = $(el).find(".p-item-img img").attr("src");
        let price =
          $(el).find(".price-new").text().trim() ||
          $(el).find(".p-item-price").text().trim();
        const status = price.toLowerCase().includes("out of stock")
          ? "Out of Stock"
          : "In Stock";
        products.push({ name, link, image, price, status });
      });
      return products;
    }
  );

const scrapeRyans = async (query) =>
  scrapePage(
    `https://www.ryans.com/search?q=${encodeURIComponent(query)}`,
    (html) => {
      const $ = cheerio.load(html);
      const products = [];
      $(".category-single-product").each((_, el) => {
        const name = $(el).find(".card-text a").first().text().trim();
        const link = $(el).find(".image-box a").attr("href");
        const image = $(el).find(".image-box img").attr("src");
        const price = $(el).find(".pr-text.cat-sp-text").text().trim();
        const status = price ? "In Stock" : "Out of Stock";
        products.push({ name, link, image, price, status });
      });
      return products;
    }
  );

const scrapeTechland = async (query) =>
  scrapePage(
    `https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(
      query
    )}`,
    (html) => {
      const $ = cheerio.load(html);
      const products = [];
      $(".product-layout").each((_, el) => {
        const name = $(el).find(".caption .name a").text().trim();
        const link = $(el).find(".caption .name a").attr("href");
        const image = $(el).find(".product-img img").attr("src");
        const price =
          $(el).find(".price-new").text().trim() ||
          $(el).find(".price-old").text().trim() ||
          "Not Available";
        const stock =
          $(el).find(".stats .stat-1 span").last().text().trim() || "Unknown";
        products.push({ name, link, image, price, stock });
      });
      return products;
    }
  );

const scrapeBinaryLogic = async (query) =>
  scrapePage(
    `https://www.binarylogic.com.bd/search/${encodeURIComponent(query)}`,
    (html) => {
      const $ = cheerio.load(html);
      const products = [];
      $(".single_product").each((_, el) => {
        const name = $(el).find(".product-title a").text().trim();
        const link = $(el).find(".product-title a").attr("href");
        const image = $(el).find(".product-thumbnail img").attr("src");
        const price =
          $(el).find(".current_price").text().trim() || "Not Available";
        const stock = $(el).find(".badge").text().includes("Stock")
          ? "In Stock"
          : "Out of Stock";
        products.push({ name, link, image, price, stock });
      });
      return products;
    }
  );

const scrapePcHouse = async (query) =>
  scrapePage(
    `https://www.pchouse.com.bd/index.php?route=product/search&search=${encodeURIComponent(
      query
    )}`,
    (html) => {
      const $ = cheerio.load(html);
      const products = [];
      $(".product-thumb").each((_, el) => {
        const name = $(el).find(".name a").text().trim();
        const link = $(el).find(".name a").attr("href");
        const image = $(el).find(".image img").attr("src");
        const price = $(el).find(".price .price-normal").text().trim();
        const status = $(el)
          .find(".btn-extra-93 span")
          .text()
          .includes("Call For Price")
          ? "Call for Price"
          : price
          ? "In Stock"
          : "Out of Stock";
        products.push({ name, link, image, price, status });
      });
      return products;
    }
  );

const scrapePotakait = async (query) =>
  scrapePage(
    `https://www.potakait.com/index.php?route=product/search&search=${encodeURIComponent(
      query
    )}`,
    (html) => {
      const $ = cheerio.load(html);
      const products = [];
      $(".product-thumb").each((_, el) => {
        const name = $(el).find(".name a").text().trim();
        const link = $(el).find(".name a").attr("href");
        const image = $(el).find(".product-img img").attr("src");
        const price = $(el).find(".price .price-new").text().trim();
        const originalPrice = $(el).find(".price .price-old").text().trim();
        const status = $(el).find(".product-labels b").text().includes("Save")
          ? "In Stock"
          : "Out of Stock";
        products.push({ name, link, image, price, originalPrice, status });
      });
      return products;
    }
  );

const scrapeComputerMania = async (query) =>
  scrapePage(
    `https://computermania.com.bd/?s=${encodeURIComponent(
      query
    )}&post_type=product`,
    (html) => {
      const $ = cheerio.load(html);
      const products = [];
      $(".wd-product").each((_, el) => {
        const name = $(el).find(".wd-entities-title a").text().trim();
        const link = $(el).find(".wd-entities-title a").attr("href");
        const image = $(el).find(".product-image-link img").attr("src");
        const price = $(el).find(".price ins bdi").text().trim();
        const originalPrice = $(el).find(".price del bdi").text().trim();
        const discount = $(el).find(".onsale").text().trim();
        const status =
          $(el).find(".add_to_cart_button").length > 0
            ? "In Stock"
            : "Out of Stock";
        products.push({
          name,
          link,
          image,
          price,
          originalPrice,
          discount,
          status,
        });
      });
      return products;
    }
  );

app.get("/api/scrape", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ error: "Query parameter is required" });

    const results = await Promise.allSettled([
      scrapeStartech(query),
      scrapeRyans(query),
      scrapeTechland(query),
      scrapeBinaryLogic(query),
      scrapePcHouse(query),
      scrapePotakait(query),
      scrapeComputerMania(query),
    ]);
    console.log("Scraping Results:", results);

    const storeResults = {
      startech: results[0].value || [],
      ryans: results[1].value || [],
      techland: results[2].value || [],
      binaryLogic: results[3].value || [],
      pcHouse: results[4].value || [],
      potakait: results[5].value || [],
      computerMania: results[6].value || [],
    };

    return res.status(200).json(storeResults);
  } catch (error) {
    console.error("Scraping Error:", error);
    return res.status(500).json({ error: "Scraping failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
