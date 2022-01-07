class CrystalStorage {
    static baseCost = {
        metal: 1000,
        crystal: 500,
    }
    static cost(res, level) {
        return Math.round(res * Math.pow(2, level - 1));
    }

    static getCost(level) {
        const newCost = {};

        for (const res in CrystalStorage.baseCost) {
            newCost[res] = CrystalStorage.cost(CrystalStorage.baseCost[res], level);
        }

        return newCost;
    }

    static getCapacity(level) {
        return 5000 * Math.floor(2.5 * Math.pow(Math.E, 20 / 33 * level));
    }

    static getStats(level = 1, a = 1) {
        return {
            cost: CrystalStorage.getCost(level),
            capacity: CrystalStorage.getCapacity(level),
        }
    }
}

module.exports = CrystalStorage;
