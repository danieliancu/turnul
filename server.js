import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
const PORT = 5000;

// Middleware pentru gestionarea CORS
app.use(cors());
app.use(express.json());

// Configurare site-uri și tag-uri
const sitesConfig = {
  g4media: {
    url: "https://g4media.ro",
    tags: ["h3"], // Caută doar <h3>
  },
  ziare: {
    url: "https://ziare.com",
    tags: ["h1", "h2", "h3"], // Caută <h1>, <h2>, <h3>
  },
  hotnews: {
    url: "https://hotnews.ro",
    tags: ["h2"], // Caută doar <h2>
  },
  adevarul: {
    url: "https://adevarul.ro",
    tags: ["div.svelte-4dr2hm"], // // Caută după clasa specifica
  },  
  spotmedia: {
    url: "https://spotmedia.ro",
    tags: ["div.mbm-h6", "div.mbm-h5"], // Caută după clase specifice
  },
  digi24: {
    url: "https://digi24.ro",
    tags: ["h2", "h3"], // Caută <h2> și <h3>
  },
  libertatea: {
    url: "https://libertatea.ro",
    tags: ["h2", "h3"], // Caută <h2> și <h3>
  },
  stirileprotv: {
    url: "https://stirileprotv.ro",
    tags: ["h2", "h3"], // Caută după <h2> și <h3>
  },
  news: {
    url: "https://news.ro",
    tags: ["h2"], // Caută după <h2> și <h3>
  },  
};

// Funcție pentru scraping tag-uri
const scrapeTags = async (page, tags) => {
  const results = [];
  for (const tag of tags) {
    const elements = await page.$$eval(
      tag,
      (elements, tagName) =>
        elements.map((el) => {
          const link = el.querySelector("a");
          const cleanedText = el.textContent
            .trim()
            .replace(/\b\d{2}:\d{2}\b/, "") // Elimină orele din text (ex. "14:41")
            .replace(/\s*\d+$/, "") // Elimină cifrele de la sfârșitul textului (ex. "titlu 22")
            .replace(/^-+\s*/, ""); // Elimină liniile doar de la începutul textului (ex. "- titlu")
          return {
            tag: tagName,
            text: cleanedText,
            href: link ? link.href : null,
          };
        }),
      tag
    );
    results.push(...elements);
  }
  return results;
};




// Endpoint pentru scraping
app.post("/scrape", async (req, res) => {
  const { source } = req.body;

  if (!source || !sitesConfig[source]) {
    return res.status(400).json({ error: "Invalid or missing source" });
  }

  const { url, tags } = sitesConfig[source];

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" }); // Așteaptă complet încărcarea paginii

    // Scrapează tag-urile configurate
    const data = await scrapeTags(page, tags);

    await browser.close();

    // Trimite datele către client
    res.json({ data });
  } catch (error) {
    console.error("Error scraping the page:", error);
    res.status(500).json({ error: "Failed to scrape the page" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
