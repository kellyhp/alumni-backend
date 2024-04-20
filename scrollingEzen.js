const puppeteer = require("puppeteer");

const scroll = async() => {
    const browser = await puppeteer.launch( {
        headless: false
    })

    const page = await browser.newPage();

    await page.goto
    ("https://equityzen.com/listings/?availability=available&valuation=vb3,vb4");

    await browser.close();

    console.log(items)

}

scroll().then(() => {
    return 1
})