const run = require("./ezenScraping.js");

const puppeteer = require("puppeteer");

const login = async (page) => {
    await page.waitForSelector('#email')
    await page.type('#email', 'alumniwebtools@gmail.com', {delay: 0})

    await page.waitForSelector('#password')
    await page.type('#password', 'J3ky2024', {delay: 0})

    await page.click('.ant-btn.ant-btn-primary.ant-btn-lg.ant-btn-block')
    await page.waitForNavigation({
        waitUntil: 'networkidle0'
    })
}


const scrape = async() => {

    const args = [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--blink-settings=imagesEnabled=false",
    ];
    const options = {
        args,
        headless: true,
        ignoreHTTPSErrors: true,
    };

    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.goto("https://equityzen.com/explore/", {
        waitUntil: 'networkidle2',
        timeout: 30000
    });

    await login(page);

    const selector = '.ExploreCarousel--row';
    await page.waitForSelector(selector);

    let results = await page.$$eval(selector, rows => {
        let links = [];
        let counter = 0;

        rows.forEach(row => {
            if (counter !== 2 && counter !== 5 && counter !== 7) {
                const rowLinks = row.querySelectorAll('a');

                rowLinks.forEach(link => {
                    if (link.href !== "https://equityzen.com/company/eztfpop5") {
                        links.push(link.href);
                    }
                });
            }
            counter++;
        });

        return links;
    });

    results = new Set(results);

    await page.close();
    await browser.close();

    let companyDetails = [];

    let fields = new Set();

    for (const row of results) {
        const detail = await run(row);
        companyDetails.push(detail);
        detail.industries.forEach(industry => fields.add(industry));
    }

    console.log(fields)

    return companyDetails;
}

// scrape().then((results) => {
//     let result;
//     for(result of results) {
//         console.log(result)
//     }
// })

module.exports = scrape;
