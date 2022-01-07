const axios = require("axios");

module.exports = async function (callback, err) {
    const { login, password } = process.env;
    let gameForgeAuthStatus;
    let gfTokenProduction;
    let gfChallengeId

    await axios.post("https://gameforge.com/api/v1/auth/thin/sessions", {
        "identity": login,
        "password": password,
        "locale": "ru_RU",
        "gfLang": "ru",
        "platformGameId": "1dfd8e7e-6e1a-4eb1-8c64-03c3b62efd2f",
        "gameEnvironmentId": "0a31d605-ffaf-43e7-aa02-d06df7116fc8",
        "autoGameAccountCreation": false
    }).then((res) => {
        gameForgeAuthStatus = res.status;
        gfTokenProduction = res.data.token;
    }).catch((err) => {
        gameForgeAuthStatus = err.response.status;
        gfChallengeId = err.response.headers["gf-challenge-id"].split(";")[0];
    });

    if (gfChallengeId) {
        let captchaInitiated = false;

        await axios.get(`https://challenge.gameforge.com/challenge/${gfChallengeId}`).then((res) => {
            if (res.data.type === "gf-image-drop-captcha") {
                captchaInitiated = true;
            }
        });

        await axios.get(`https://image-drop-challenge.gameforge.com/challenge/${gfChallengeId}/ru-RU`, {
            answer: 1
        }).then((res) => {
            if (res.status !== 200) {
                captchaInitiated = false;
            }
        })

        if (!captchaInitiated) {
            err({message: "Can't initiate captcha"});
            return;
        }
        
        let unlocked = false;
        let attempts = 0;
        let maxAttempts = 3;

        while (unlocked === false && attempts < maxAttempts) {
            await axios.post(`https://image-drop-challenge.gameforge.com/challenge/${gfChallengeId}/ru-RU`, {
                answer: 1
            }).then(res => {
                console.log("Captcha status", res.data.status);

                if (res.data.status === "solved") {
                    unlocked = true
                    console.log("Captcha right answer");
                } else {
                    console.log("Captcha wrong answer");
                }

                attempts += 1;
            });
        }

        if (attempts === maxAttempts) {
            err({ message: "Blocked by captcha" });
            return;
        }
    }



    let sessionInitiateUrl;

    await axios.get("https://lobby.ogame.gameforge.com/api/users/me/loginLink?id=101672&server[language]=ru&server[number]=176&clickedButton=account_list", {
        headers: {
            "authorization": `Bearer ${gfTokenProduction}`
        }
    }).then((res) => {
        sessionInitiateUrl = res.data.url;
    }).catch((err) => {

    })

    if (!sessionInitiateUrl) {
        err({ message: "Can't reciewed session initiate url" });
        return;
    }

    sessionInitiateUrl = `${sessionInitiateUrl}&displayLocale=ru_RU`;

    let phpsessid;
    let prsess;

    await axios.get(sessionInitiateUrl, {
        maxRedirects: 0
    }).catch((err) => {
        const cookies = err.response.headers['set-cookie'];

        for (const coockie of cookies) {
            const keyValue = coockie.split(";")[0];
            const [key, value] = keyValue.split("=");

            switch (key) {
                case "PHPSESSID":
                    phpsessid = value;
                    break;
                case "prsess_101672":
                    prsess = value;
                    break;
            }
        }
    });


    const cookieSet = `PHPSESSID=${phpsessid}; prsess_101672=${prsess}; gf-token-production=${gfTokenProduction};`;

    callback(cookieSet);
}