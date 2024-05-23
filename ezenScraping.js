const puppeteer = require("puppeteer");

const getName = async(page) => {
    return await page.evaluate(() => {
        let name = document.querySelector(".PublicCompanyHero--name").innerText;
        if (name.includes("Stock")) {
            name = name.replace(" Stock", "");
        }
        return name;
    })
}


const getFounders = async (page) => {
    return await page.evaluate(() => {

        let container = document.querySelector('.CompanyManagement--container');

        let columnOneH5 = container.querySelector('.CompanyManagement--column-one h5');
        let columnOneP = container.querySelector('.CompanyManagement--column-one p');

        let columnTwo = container.querySelector('.CompanyManagement--column-two');
        let columnTwoH5 = columnTwo ? columnTwo.querySelector('h5') : null;
        let columnTwoP = columnTwo ? columnTwo.querySelector('p') : null;

        return [
            {
                position: columnOneH5.textContent,
                name: columnOneP.textContent
            },
            {
                position: columnTwoH5 ? columnTwoH5.textContent : null,
                name: columnTwoP ? columnTwoP.textContent : null
            }
        ];
    })
}

const getCompanyDetails = async (page) => {
    return await page.evaluate(() => {
        return Array.from(document.querySelectorAll(".CompanyKeyDetails--detail"),
            (e) => ({
                feature: e.querySelector("p").innerText,
                content: e.querySelector("h4").innerText
            })
        );
    });
};


const getBio = async (page) => {
    return await page.evaluate(() => {
        return document.querySelector(".PublicCompanyHero--one-liner").innerText
    })
}

const getIndustry = async (page) => {
    return await page.evaluate(() => {
        const tags = document.querySelectorAll('h5.CompanyKeyDetails--tag');

        const tagTexts = [];

        tags.forEach(tag => {
            tagTexts.push(tag.innerText);
        });

        return tagTexts
    })
}

const detailFind = (list, data) => {
    const result = list.find(obj => obj.feature === data)
    if (result === undefined) {
        return "";
    } else {
        return result.content;
    }
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
      "founders": null,
      "alumnis": null,
      "bio": null,
        "ezenLink": url,
        "industries": null,
        "favorite":false
    }

    let name = await getName(page);
    company.name = (name !== undefined) ? name : "";

    let founders = await getFounders(page);

    if (founders[1].position === null) {
        founders.pop()
    }
    company.founders = (founders !== undefined) ? founders : "";

    const companyDetails = await getCompanyDetails(page);

    company.foundingDate = detailFind(companyDetails, "Founded");
    company.notableInvestors = detailFind(companyDetails, "Notable Investor");
    company.hq = detailFind(companyDetails, "Headquarters");
    company.totalFunding = detailFind(companyDetails, "Total Funding");

    let bio = await getBio(page);
    company.bio = (bio !== undefined) ? bio : "";

    let industries = await getIndustry(page);
    company.industries = (industries !== undefined) ? industries : "";

    await browser.close();

    return company;
}

// run("https://equityzen.com/company/databricks/").then(result => {
//     console.log(result)
// })

module.exports = run;