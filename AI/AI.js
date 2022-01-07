const { default: axios } = require("axios");

class AI {
    underAttack;
    empire;
    action;
    authorizationCookie;

    constructor(empire, authorizationCookie) {
        this.empire = empire;
        this.underAttack = false;
        this.authorizationCookie = authorizationCookie;
    }

    async act() {
        const { type, id } = this.action;

        switch (type) {
            case "build":
                const options = {
                    params: {
                        page: "ingame",
                        component: "supplies",
                        modus: "1",
                        menge: "1",
                        token: this.empire.tokens.upgrade,
                        type: id,
                    },
                    headers: {
                        "Cookie": "maximizeId=null;" + this.authorizationCookie,
                    }
                }

                await axios.get("https://s176-ru.ogame.gameforge.com/game/index.php", options);

                break;
        }
    }
}

module.exports = AI;
/**
 * page=ingame
 * component=supplies
 * modus=1
 * token=ebf6464a630ea4ea4e97473b1d7a5acc
 * type=4
 * menge=1
 * 
 * maximizeId=null;
 * gf-cookie-consent-4449562312=|7|1;
 * gf-token-production=d163754a-545d-467a-8588-99ec13acad83;
 * PHPSESSID=3b90c49464976a88dd99922e35bfd2a4fa7d997d;
 * prsess_101672=91b0ef30a940603ed66def4034eb4af0:
 */