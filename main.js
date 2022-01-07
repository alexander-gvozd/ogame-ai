const axios = require("axios");
const auth = require("./services/auth");
const colors = require("colors");
const cheerio = require("cheerio");
const AIBuilder = require("./AI/AIBuilder");
const log = require("./services/log");
const db = require("./services/database");
const pageUrls = {
    mainPage: "https://s176-ru.ogame.gameforge.com/game/index.php?page=ingame&component=overview",
    resourcesPage: "https://s176-ru.ogame.gameforge.com/game/index.php?page=ingame&component=supplies",
}
const pageContents = {
    $mainPage: null,
    $resourcesPage: null,
}
const schedule = require('node-schedule');

async function collectEmpireInfo() {
    let authorizationCookie = await db.session.get();
    let isAuthorised = false;

    // load main page
    await axios.get(pageUrls.mainPage, {
        headers: {
            "Cookie": authorizationCookie
        }
    }).then((res) => {
        const html = res.data;

        if (html.search("ogame-session") !== -1) {
            pageContents.$mainPage = cheerio.load(html);
            isAuthorised = true;
        }
    });

    if (!isAuthorised) {
        let aurhAttempts = 0;
        let maxAuthAttempts = 5;

        while (isAuthorised === false && aurhAttempts < maxAuthAttempts) {
            await auth((cookieSet) => {
                authorizationCookie = cookieSet;
                db.session.set(authorizationCookie);
                isAuthorised = true;
            }, function (err) {
                console.error(colors.red(err.message));
            });

            aurhAttempts++;
        }

        // load main page
        await axios.get(pageUrls.mainPage, {
            headers: {
                "Cookie": authorizationCookie
            }
        }).then((res) => {
            pageContents.$mainPage = cheerio.load(res.data);
        });

        if (!isAuthorised) {
            console.log(colors.red("NO AUTHORISED. END SESSION"));
            return;
        }
    }

    // load resourcesPage
    await axios.get(pageUrls.resourcesPage, {
        headers: {
            "Cookie": authorizationCookie
        }
    }).then((res) => {
        pageContents.$resourcesPage = cheerio.load(res.data);
    });

    //parse loaded pages
    const empire = {
        resources: {},
        technologies: {},
        tokens: {},
        endBuildingSupply: 0,
    };
    let $;

    //parse main page
    $ = pageContents.$mainPage;

    empire.resources.metal = parseInt($("#resources_metal").attr("data-raw"));
    empire.resources.crystal = parseInt($("#resources_crystal").attr("data-raw"));
    empire.resources.deuterium = parseInt($("#resources_deuterium").attr("data-raw"));
    empire.resources.energy = parseInt($("#resources_energy").attr("data-raw"));
    empire.resources.darkmatter = parseInt($("#resources_darkmatter").attr("data-raw"));

    //parse resources building
    $ = pageContents.$resourcesPage;

    empire.tokens.upgrade = $.html().match(/var upgradeEndpoint .+?;/)[0].match(/token=(\w+)/)[1];

    if ($.html().search("countdownbuildingDetails") !== -1) {
        empire.endBuildingSupply = $("#countdownbuildingDetails").attr("data-end") * 1000;
    }

    $(".technology").each((i, elem) => {
        const $elem = $(elem);
        const technologyId = $elem.attr("data-technology");
        const level = $elem.find(".level").attr("data-value");

        //is not buildings
        if (!level) {
            return;
        }

        empire.technologies[technologyId] = {level: parseInt(level)};
    });

    return [empire, authorizationCookie];
}

async function Main() {
    const [empire, authorizationCookie] = await collectEmpireInfo();
    const ai = new AIBuilder(empire, authorizationCookie);

    console.log(empire);

    await ai.act();
}

Main();

setInterval(Main, 1000 * 60 * 5);