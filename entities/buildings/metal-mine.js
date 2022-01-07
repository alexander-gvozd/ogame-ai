class MetalMine {
    static baseCost = {
        metal: 60,
        crystal: 15,
    }

    static cost(res, level) {
        return Math.round(res * Math.pow(1.5, level - 1));
    }

    static getCost(level) {
        const newCost = {};

        for (const res in MetalMine.baseCost) {
            newCost[res] = MetalMine.cost(MetalMine.baseCost[res], level);
        }

        return newCost;
    }

    static getProduction(level, a) {
        return Math.round(30 * a * level * Math.pow(1.1, level));
    }

    static getStats(level = 1, a = 1) {
        return {
            cost: MetalMine.getCost(level),
            production: MetalMine.getProduction(level, a),
        }
    }
}

module.exports = MetalMine;
