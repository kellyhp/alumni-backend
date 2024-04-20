const puppeteer = require("puppeteer");

const getName = async(page) => {
    return await page.evaluate(() => {
        let name = document.querySelector(".margin-bottom-0").innerText;
        if (name.includes("Stock")) {
            name = name.replace(" Stock", "");
        }
        return {name};
    })
}

const getFundingRecord = async (page) => {
    return await page.evaluate(() => {
        return Array.from(document
                .querySelectorAll('.ant-descriptions-row'),
            (e) => ({
                period: e.querySelector('.ant-descriptions-item-label' +
                    '.ant-descriptions-item-colon').innerText,
                amount: e.querySelector('.ant-descriptions-item-content' +
                    '.propertyListItem').innerText
            }))

    });
}


const getFounders = async (page) => {
    return await page.evaluate(() => {
        return Array.from(
            document.querySelectorAll(".SimpleListInColumns"),
            (e) => {
                const positions = Array.from(e.querySelectorAll('h5'),
                        h5 => h5.innerText);
                const names = Array.from(e.querySelectorAll('p'),
                        p => p.innerText);

                return positions.map((position, index) => ({
                    position: position,
                    name: names[index]
                }));
            }
        ).flat(); // Flatten the array of arrays
    })
}

const getCompanyDetails = async (page) => {
    return await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".keyCompanyDetail"),
            (e) => ({
                detail: e.querySelector("h5").innerText,
                content: e.querySelector("p").innerText
            })
        )
    })
}

const getBio = async (page) => {
    return await page.evaluate(() => {
        let bio = document.querySelector("p").innerText;
        return {bio}
    })
}

const run = async () => {
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.goto("https://equityzen.com/company/figma", {
        waitUntil: "domcontentloaded"
    });

    const name = await getName(page);

    const fundingRecord = await getFundingRecord(page);

    const founders = await getFounders(page);

    const [foundingDate, notableInvestors, hq, totalFunding] =
        await getCompanyDetails(page);

    const bio = await getBio(page);

    await browser.close();

    return ([name, foundingDate, notableInvestors, hq, totalFunding,
        fundingRecord, founders, bio])
}


run().then(result => {
    console.log(result)
}).catch(err => {
    console.log(err)
})
