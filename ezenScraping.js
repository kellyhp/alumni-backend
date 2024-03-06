const puppeteer = require("puppeteer");

const getFunding = async (page) => {
    return await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.ant-descriptions-row'),
            (e) => ({
                period: e.querySelector('.ant-descriptions-item-label.ant-descriptions-item-colon').innerText,
                amount: e.querySelector('.ant-descriptions-item-content.propertyListItem').innerText
            }))

    });
}


const getFounders = async (page) => {
    return await page.evaluate(() => {
        return Array.from(
            document.querySelectorAll(".SimpleListInColumns"),
            (e) => {
                const positions = Array.from(e.querySelectorAll('h5'), h5 => h5.innerText);
                const names = Array.from(e.querySelectorAll('p'), p => p.innerText);

                return positions.map((position, index) => ({
                    position: position,
                    name: names[index]
                }));
            }
        ).flat(); // Flatten the array of arrays
    })
}
const run = async () => {
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.goto("https://equityzen.com/company/chime2/", {
        waitUntil: "domcontentloaded"
    });

    let funding = await getFunding(page);

    const founders = await getFounders(page);

    console.log([funding, founders]);

    await browser.close();

    return ([funding, founders])
}

run();