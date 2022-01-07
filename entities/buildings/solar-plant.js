class SolarPlant {
    static baseCost = {
        metal: 75,
        crystal: 30,
    }

    static cost(res, level) {
        return Math.ceil(res * Math.pow(1.5, level - 1));
    }

    static getCost(level) {
        const newCost = {};

        for (const res in SolarPlant.baseCost) {
            newCost[res] = SolarPlant.cost(SolarPlant.baseCost[res], level);
        }

        return newCost;
    }

    static getProduction(level) {
        return Math.ceil(20 * level * Math.pow(1.1, level));
    }

    static getStats(level = 1) {
        return {
            cost: SolarPlant.getCost(level),
            production: SolarPlant.getProduction(level),
        }
    }
}

module.exports = SolarPlant;
