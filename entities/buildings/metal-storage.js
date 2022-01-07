class MetalStorage {
    static baseCost = {
        metal: 1000,
    }

    static cost(res, level) {
        return Math.round(res * Math.pow(2, level - 1));
    }

    static getCost(level) {
        const newCost = {};

        for (const res in MetalStorage.baseCost) {
            newCost[res] = MetalStorage.cost(MetalStorage.baseCost[res], level);
        }

        return newCost;
    }

    static getCapacity(level) {
        return 5000 * Math.floor(2.5 * Math.pow(Math.E, 20 / 33 * level));
    }

    static getStats(level = 1, a = 1) {
        return {
            cost: MetalStorage.getCost(level),
            capacity: MetalStorage.getCapacity(level),
        }
    }
}

module.exports = MetalStorage;
