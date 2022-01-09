class CrystalMine {
    static id = 2;
    static baseCost = {
        metal: 48,
        crystal: 24,
    }

    static cost(res, level) {
        return Math.round(res * Math.pow(1.6, level - 1));
    }

    static getCost(level) {
        const newCost = {};

        for (const res in CrystalMine.baseCost) {
            newCost[res] = CrystalMine.cost(CrystalMine.baseCost[res], level);
        }

        return newCost;
    }

    static getProduction(level, a) {
        return Math.round(20 * a * level * Math.pow(1.1, level));
    }

    static getStats(level = 1, a = 1) {
        return {
            cost: CrystalMine.getCost(level),
            production: CrystalMine.getProduction(level, a),
        }
    }
}

module.exports = CrystalMine;
