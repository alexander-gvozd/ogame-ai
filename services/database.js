const path = require("path");
const { promises: fs, constants } = require("fs");
const {
    O_RDWR,
    O_CREAT,
} = constants;

module.exports = {
    /**
     * сохранить последние куки, используемые для авторизации в файл, 
     * чтобы потом можно было лишний раз не авторизовываться
    */
    session: {
        get: async function () {
            return await fs.readFile("./database/session.txt", { encoding: 'utf-8' });
        },
        set: async function (authorizationCookie) {
            await fs.open(path.resolve("./database/session.txt"), O_RDWR | O_CREAT).then((fd) => {
                fd.writeFile(authorizationCookie, { encoding: 'utf-8' });
            });            
        }
    },
}