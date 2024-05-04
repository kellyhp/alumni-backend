import puppeteer from "puppeteer";

const getName = async(page) => {
    return await page.evaluate(() => {
        let name = document.querySelector(".margin-bottom-0").innerText;
        if (name.includes("Stock")) {
            name = name.replace(" Stock", "");
        }
        return name;
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
            (e) => e.querySelector("p").innerText
        );
    });
};


const getBio = async (page) => {
    return await page.evaluate(() => {
        let bio = document.querySelector("p").innerText;
        return bio
    })
}

const run = async (url) => {
    const browser = await puppeteer.launch({
        headless: true
    });

    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: "domcontentloaded"
    });

    let company = {
      "name": null,
      "foundingDate": null,
      "notableInvestors": null,
      "hq": null,
      "totalFunding": null,
      "fundingRecord": null,
      "founders": null,
      "alumnis": null,
      "bio": null,
        "ezenLink": url
    }

    let name = await getName(page);
    company.name = (name !== undefined) ? name : "";

    let fundingRecord = await getFundingRecord(page);
    company.fundingRecord = (fundingRecord !== undefined) ? fundingRecord : "";

    let founders = await getFounders(page);
    company.founders = (founders !== undefined) ? founders : "";

    let [foundingDate, notableInvestors, hq, totalFunding] =
        await getCompanyDetails(page);
    company.foundingDate = (foundingDate !== undefined) ? foundingDate : "";
    company.notableInvestors = (notableInvestors !== undefined) ? notableInvestors : "";
    company.hq = (hq !== undefined) ? hq : "";
    company.totalFunding = (totalFunding !== undefined) ? totalFunding : "";

    let bio = await getBio(page);
    company.bio = (bio !== undefined) ? bio : "";

    await browser.close();

    return JSON.stringify(company);
}

export { run };