import axios from "axios";
import * as cheerio from "cheerio";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

async function scrapeStartech(query) {
  const url = `https://www.startech.com.bd/product/search?search=${encodeURIComponent(
    query
  )}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const products = [];
  $(".p-item").each((_, el) => {
    const name = $(el).find(".p-item-name a").text().trim();
    const link = $(el).find(".p-item-name a").attr("href");
    const image = $(el).find(".p-item-img img").attr("src");
    let price = $(el).find(".price-new").text().trim();
    if (!price) {
      price = $(el).find(".p-item-price").text().trim();
    }

    const status = price.toLowerCase().includes("out of stock")
      ? "Out of Stock"
      : "In Stock";

    products.push({
      name,
      link,
      image,
      price,
      status,
    });
  });

  return products;
}
async function scrapeRyans(query) {
  const url = `https://www.ryans.com/search?q=${encodeURIComponent(query)}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const products = [];

  $(
    ".cus-col-1.cus-col-2.cus-col-3.cus-col-4.cus-col-5.category-single-product.mb-1"
  ).each((_, el) => {
    const name = $(el).find(".card-text a").first().text().trim();
    const link = $(el).find(".image-box a").attr("href");
    const image = $(el).find(".image-box img").attr("src");
    const price = $(el)
      .find(".pr-text.cat-sp-text")
      .text()
      .trim()
      .replace(/\s+/g, " ");
    const status = price ? "In Stock" : "Out of Stock";

    products.push({
      name,
      link,
      image,
      price,
      status,
    });
  });

  return products;
}

async function scrapeTechland(query) {
  const url = `https://www.techlandbd.com/index.php?route=product/search&search=${encodeURIComponent(
    query
  )}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const products = [];

  $(".product-layout").each((_, el) => {
    const name = $(el).find(".caption .name a").text().trim();
    const link = $(el).find(".caption .name a").attr("href");
    const image = $(el).find(".product-img img").attr("src");
    const priceNew = $(el).find(".price-new").text().trim();
    const priceOld = $(el).find(".price-old").text().trim();
    const stock = $(el).find(".stats .stat-1 span").last().text().trim();

    products.push({
      name,
      link,
      image,
      price: priceNew || priceOld || "Not Available",
      oldPrice: priceOld || null,
      stock: stock || "Unknown",
    });
  });

  return products;
}
async function scrapeBinaryLogic(query) {
  const url = `https://www.binarylogic.com.bd/search/${encodeURIComponent(
    query
  )}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const products = [];

  $(".single_product").each((_, el) => {
    const name = $(el).find(".p-item-name a").text().trim();
    const link = $(el).find(".p-item-name a").attr("href");
    const image = $(el).find(".p-item-img img").attr("src");
    const priceNew = $(el).find(".current_price").text().trim();
    const priceOld = $(el).find(".old_price").text().trim();
    const stock = $(el).find(".new-product-badge a").text().trim();

    products.push({
      name,
      link,
      image,
      price: priceNew || priceOld || "Not Available",
      oldPrice: priceOld || null,
      stock: stock || "Unknown",
    });
  });

  return products;
}
async function scrapePcHouse(query) {
  const url = `https://www.pchouse.com.bd/index.php?route=product/search&search=${encodeURIComponent(
    query
  )}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  const products = [];

  $(".product-thumb").each((_, el) => {
    const name = $(el).find(".name a").text().trim();
    const link = $(el).find(".name a").attr("href");
    const image = $(el).find(".image img").attr("src");
    const price = $(el).find(".price .price-normal").text().trim();
    const status = $(el)
      .find(".btn-extra-93 span")
      .text()
      .trim()
      .includes("Call For Price")
      ? "Call for Price"
      : price
      ? "In Stock"
      : "Out of Stock";

    products.push({
      name,
      link,
      image,
      price,
      status,
    });
  });

  return products;
}
async function scrapePotakait(query) {
  const url = `https://www.potakait.com/index.php?route=product/search&search=${encodeURIComponent(
    query
  )}`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

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

    products.push({
      name,
      link,
      image,
      price,
      originalPrice,
      status,
    });
  });

  return products;
}
async function scrapeComputerMania(query) {
  const url = `https://computermania.com.bd/?s=${encodeURIComponent(
    query
  )}&post_type=product`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

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

app.get("/api/scrape", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Query parameter is required" });
    }

    // Call the scraping functions for all stores
    const results = await Promise.all([
      scrapeStartech(query),
      scrapeRyans(query),
      scrapeTechland(query),
      scrapeBinaryLogic(query),
      scrapePcHouse(query),
      scrapePotakait(query),
      scrapeComputerMania(query),
    ]);

    // Map the results to their respective store names
    const storeResults = {
      startech: results[0],
      ryans: results[1],
      techland: results[2],
      binaryLogic: results[3],
      pcHouse: results[4],
      potakait: results[5],
      computerMania: results[6],
    };

    return res.status(200).json(storeResults);
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error scraping data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
