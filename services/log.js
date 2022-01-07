const path = require("path");
const fs = require("fs");
const {
    O_RDWR,
    O_CREAT,
    O_APPEND
} = fs.constants;

function getDate() {
    const firstZero = (number) => number > 9 ? number : `0${number}`;
    const date = new Date();
    const d = firstZero(date.getDate());
    const m = firstZero(date.getMonth() + 1);
    const y = firstZero(date.getFullYear());
    const h = firstZero(date.getHours());
    const min = firstZero(date.getMinutes());
    const s = firstZero(date.getSeconds());

    return `${d}.${m}.${y} ${h}:${min}:${s}`;
}

function log(data) {
    fs.open(path.resolve("./log/main.txt"), O_RDWR | O_CREAT | O_APPEND, (err, fd) => {
        if (err) {
            console.error(err);
            return;
        }

        const dateStr = getDate();
        let note = "";

        note += `[${dateStr}]: `;
        note += data;
        note += "\n\n";

        fs.write(fd, note, () => { });
    });
}

module.exports = log;
