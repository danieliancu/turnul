import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";
import mysql from "mysql2/promise";



const app = express();
const PORT = 5000;

// Configurare middleware CORS
app.use(cors()); // Permite toate originile
app.use(express.json());

// Configurarea conexiunii MySQL
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // Parola implicită XAMPP este goală
  database: "scraper_data",
});

// Crearea tabelei dacă nu există
await db.execute(`
  CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(50),
    text TEXT,
    href TEXT,
    imgSrc TEXT
  )
`);

// Configurare site-uri și tag-uri
const sitesConfig = {
  g4media: {
    url: "https://g4media.ro",
    tags: [{ tag: "div.post-review", contentSelector: "h3" }],
  },
  hotnews: {
    url: "https://hotnews.ro",
    tags: [{ tag: "article", contentSelector: "h2" }],
  },
  spotmedia: {
    url: "https://spotmedia.ro",
    tags: [{ tag: "div.jet-smart-listing__post", contentSelector: "div.mbm-h5" }],
    tags: [{ tag: "div.jet-smart-listing__post", contentSelector: "div.mbm-h6" }],
  },
  ziare: {
    url: "https://ziare.com",
    tags: [
      { tag: "div.spotlight__article", contentSelector: "h1.spotlight__article__title" },
      { tag: "div.spotlight__article", contentSelector: "h2.spotlight__article__title" },
      { tag: "div.news__article", contentSelector: "h3.news__article__title" },
    ],
  },
  digi24: {
    url: "https://digi24.ro",
    tags: [
      { tag: "article.article-alt", contentSelector: "h3.article-title" },
      { tag: "article", contentSelector: "h4.article-title" },      
    ],
  },
  libertatea: {
    url: "https://libertatea.ro",
    tags: [
      { tag: "div.news-item", contentSelector: "h3.article-title" },
      { tag: "div.news-item", contentSelector: "h2.article-title" },
    ],
  },
  stirileprotv: {
    url: "https://stirileprotv.ro",
    tags: [{ tag: "article.article", contentSelector: "h3.article-title-daily" }],
  }, 
  news: {
    url: "https://news.ro",
    tags: [{ tag: "article.article", contentSelector: "h2" }],
  },   
  gsp: {
    url: "https://gsp.ro",
    tags: [{ tag: "div.news-item", contentSelector: "h2" }],
  },          
  prosport: {
    url: "https://prosport.ro",
    tags: [{ tag: "div.article--wide", contentSelector: "h2.article__title" }],
  },            
};

const scrapeTags = async (page, tags, source) => {
  const results = [];
  const seenLinks = new Set();

  for (const { tag, contentSelector } of tags) {
    const elements = await page.$$eval(
      tag,
      (elements, contentSelector) =>
        elements.map((el) => {
          const imgElement = el.querySelector("img");
          const imgSrc =
          imgElement?.getAttribute("data-src") ||
          imgElement?.getAttribute("srcset")?.split(",")[0]?.split(" ")[0] ||
          imgElement?.style?.backgroundImage?.replace(/url\(["']?/, "").replace(/["']?\)/, "") ||
          imgElement?.src ||
          null;
        
          const contentElement = el.querySelector(contentSelector);
          const link = contentElement ? contentElement.querySelector("a") : null;
          return {
            imgSrc: imgSrc,
            text: contentElement ? contentElement.textContent.trim() : null,
            href: link ? link.href : null,
          };
        }),
      contentSelector
    );

    elements.forEach((element) => {
      if (element.href && !seenLinks.has(element.href)) {
        seenLinks.add(element.href);
        results.push({ ...element, source });
      }
    });
  }
  return results;
};



app.get("/scrape-all", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    for (const source in sitesConfig) {
      const { url, tags } = sitesConfig[source];
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        const data = await scrapeTags(page, tags, source);

        // Salvează fiecare articol în baza de date
        for (const item of data) {
          // Verifică dacă articolul există deja în baza de date (pe baza href, de exemplu)
          const [existing] = await db.execute(
            `SELECT id FROM articles WHERE href = ?`,
            [item.href]
          );

          if (existing.length === 0) {
            // Dacă nu există, inserează articolul
            await db.execute(
              `INSERT INTO articles (source, text, href, imgSrc) VALUES (?, ?, ?, ?)`,
              [item.source, item.text, item.href, item.imgSrc]
            );
          }
        }


        await page.close();
      } catch (error) {
        console.error(`Failed to scrape source: ${source}. Error: ${error.message}`);
      }
    }

    await browser.close();
    res.json({ message: "Scraping completed and data saved to MySQL" });
  } catch (error) {
    console.error("Error in scrape-all:", error);
    res.status(500).json({ error: "Failed to scrape all sources" });
  }
});


app.get("/articles", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM articles"); // Preia toate articolele din baza de date
    res.json({ data: rows }); // Trimite datele către client
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});




app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
