const puppeteer = require('puppeteer');
const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

// CORS headers middleware
router.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200); // Preflight request response
  } else {
    next();
  }
});

// Endpoint to fetch webpage title
router.get('/fetch-title', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    const browser = await puppeteer.launch();
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
    console.error('Error fetching title:', error);
    res.status(500).json({ error: 'Failed to fetch title' });
  }
});

// Apply the router to the root path
app.use('/', router);

// Wrap express app for serverless execution
module.exports = serverless(app);
