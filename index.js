import puppeteer from "puppeteer";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const getPrayerTimes = async (city) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(process.env.WEB_ADDRESS + city + process.env.URL);

  const cityData = await page.evaluate((city) => {
    const rows = document.querySelectorAll("table.tarawih-table tbody tr");
    const data = [];

    rows.forEach((row) => {
      const columns = row.querySelectorAll("td");
      const day = columns[0].textContent
        .substring(0, columns[0].textContent.indexOf("*"))
        .trim();
      const date = columns[1].textContent.trim();
      const fajr = columns[2].textContent.trim();
      const sunrise = columns[3].textContent.trim();
      const dhuhr = columns[4].textContent.trim();
      const asr = columns[5].textContent.trim();
      const maghrib = columns[6].textContent.trim();
      const isha = columns[7].textContent
        .substring(0, columns[7].textContent.indexOf("*"))
        .trim();

      data.push({
        city,
        date,
        day,
        times: {
          fajr,
          sunrise,
          dhuhr,
          asr,
          maghrib,
          isha,
        },
      });
    });

    return data;
  }, city);

  await browser.close();

  return cityData;
};

app.get(`/`, async (req, res) => {
  const prayerTimes = await getPrayerTimes(req.query.city);
  res.json(prayerTimes);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running`);
});
