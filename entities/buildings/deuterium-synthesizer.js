class DeuteriumSynthesizer {
    static baseCost = {
        metal: 225,
        crystal: 75,
    }

    static cost(res, level) {
        return Math.round(res * Math.pow(1.5, level - 1));
    }

    static getCost(level) {
        const newCost = {};

        for (const res in DeuteriumSynthesizer.baseCost) {
            newCost[res] = DeuteriumSynthesizer.cost(DeuteriumSynthesizer.baseCost[res], level);
        }

        return newCost;
    }

    static maximumEnergyConsumption(level) {
        return 20 * level * Math.pow(1.1, level);
    }

    static getProduction(level, a, tAvg) {
        const e = DeuteriumSynthesizer.maximumEnergyConsumption(level);

        return Math.round(a * e * (0.68 - 0.002 * tAvg));
    }

    static getStats(level = 1, a = 1, tAvg) {
        return {
            cost: DeuteriumSynthesizer.getCost(level),
            production: DeuteriumSynthesizer.getProduction(level, a, tAvg),
        }
    }
}

module.exports = DeuteriumSynthesizer;
