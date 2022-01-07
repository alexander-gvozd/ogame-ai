class DeuteriumTank {
    static baseCost = {
        metal: 1000,
        crystal: 1000,
    }
    static cost(res, level) {
        return Math.round(res * Math.pow(2, level - 1));
    }

    static getCost(level) {
        const newCost = {};

        for (const res in DeuteriumTank.baseCost) {
            newCost[res] = DeuteriumTank.cost(DeuteriumTank.baseCost[res], level);
        }

        return newCost;
    }

    static getCapacity(level) {
        return 5000 * Math.floor(2.5 * Math.pow(Math.E, 20 / 33 * level));
    }

    static getStats(level = 1, a = 1) {
        return {
            cost: DeuteriumTank.getCost(level),
            capacity: DeuteriumTank.getCapacity(level),
        }
    }
}

module.exports = DeuteriumTank;
