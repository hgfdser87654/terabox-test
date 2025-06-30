const express = require("express"); const puppeteer = require("puppeteer"); const fs = require("fs"); const cors = require("cors");

const app = express(); app.use(cors());

const PORT = 3000;

app.get("/api", async (req, res) => { const link = req.query.link; if (!link) return res.status(400).json({ error: "No link provided" });

try { const cookiesRaw = fs.readFileSync("cookies.txt", "utf8"); const cookies = cookiesRaw.split("; ").map(pair => { const [name, value] = pair.split("="); return { name, value, domain: ".terabox.com" }; });

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
const page = await browser.newPage();

await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
await page.setExtraHTTPHeaders({ referer: "https://www.terabox.com/" });

await page.setCookie(...cookies);
await page.goto(link, { waitUntil: "networkidle2", timeout: 60000 });

const data = await page.evaluate(() => {
  const title = document.querySelector(".filename")?.textContent || null;
  const size = document.querySelector(".filesize")?.textContent || null;
  const thumb = document.querySelector(".preview-img")?.src || null;
  const ext = title ? title.split(".").pop() : null;
  const dlink = document.querySelector(".download-button")?.href || null;
  return { title, size, thumb, ext, dlink };
});

await browser.close();

if (!data.title) return res.status(404).json({ error: "File not found or protected." });

res.json({
  filename: data.title,
  size: data.size,
  extension: data.ext,
  thumbnail: data.thumb,
  download_url: data.dlink
});

} catch (error) { console.error("API Error:", error); res.status(500).json({ error: "Server error. Try again later." }); } });

app.listen(PORT, () => { console.log(✅ Server running on port ${PORT}); });
