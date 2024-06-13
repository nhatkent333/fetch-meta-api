const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint to fetch webpage title using Puppeteer
app.get('/api/fetch-title', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      devtools: true,
      args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins',
        '--disable-site-isolation-trials'
      ]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for page to load completely
    await page.waitForSelector('title');

    // Get the title of the page
    const title = await page.title();

    await browser.close();

    if (!title) {
      throw new Error('No title found');
    }

    res.json({ title });
  } catch (error) {
    console.error('Error fetching title:', error.message);
    res.status(500).json({ error: 'Failed to fetch title' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
