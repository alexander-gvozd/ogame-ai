const buildings = require("../consts/ai").buildings;
const AI = require("./AI");
const MetalMine = require("../entities/buildings/metal-mine");
const CrystalMine = require("../entities/buildings/crystal-mine");
const DeuteriumSynthesizer = require("../entities/buildings/deuterium-synthesizer");
const MetalStorage = require("../entities/buildings/metal-storage");
const CrystalStorage = require("../entities/buildings/crystal-storage");
const DeuteriumTank = require("../entities/buildings/deuterium-tank");
const SolarPlant = require("../entities/buildings/solar-plant");
const {empty} = require("cheerio/lib/api/manipulation");
const colors = require("colors");

/**
 * AI builder
 *
 * Приоритеты:
 * Атака
 * Энергия
 * Хранилище
 *  уровенить хранилища должен коррелироваться с уровнем шахты
 *
 * Стоимость
 * Баланс
 */
class AIBuilder extends AI {
    static resourcesProductionRelation = {
        metal: 1,
        crystal: 0.5,
        deuterium: 0.25
    };

    constructor(...args) {
        super(...args);
    }

    //if insufficient resources then return false else true
    canBuild(cost) {
        for (const res in cost) {
            if (this.empire.resources[res] < cost[res]) {
                return false;
            }
        }

        return true;
    }

    sense() {
    }

    getNextBuildingId() {
        //todo динамическая переменная
        const tAvg = -7;

        //решить проблему с переполненными хранилищами
        const metalStorageLevel = this.empire.technologies[buildings.metalStorage].level;
        const crystalStorageLevel = this.empire.technologies[buildings.crystalStorage].level;
        const deuteriumTankLevel = this.empire.technologies[buildings.deuteriumTank].level;

        // build metal storage if it needed
        if (MetalStorage.getCapacity(metalStorageLevel) <= this.empire.resources.metal &&
            this.canBuild(MetalStorage.getCost(metalStorageLevel + 1))
        ) {
            return MetalStorage;
        }

        // build crystal storage if it needed
        if (CrystalStorage.getCapacity(crystalStorageLevel) <= this.empire.resources.crystal &&
            this.canBuild(CrystalStorage.getCost(crystalStorageLevel + 1))
        ) {
            return CrystalStorage;
        }

        // build deuterium tank if it needed
        if (DeuteriumTank.getCapacity(deuteriumTankLevel) <= this.empire.resources.deuterium &&
            this.canBuild(DeuteriumTank.getCost(deuteriumTankLevel + 1))
        ) {
            return DeuteriumTank;
        }

        //решить проблемы с подачей энергии
        if (this.empire.resources.energy < 0) {
            //todo: выбор электростанции должен получаться из рассчёта стоимости одной единицы энергии
            return SolarPlant;
        }

        //улучшить шахту
        const universeAccelerate = parseInt(process.env.UNIVERSE_ACCELERATE);
        const metalLevel = this.empire.technologies[buildings.metalMine].level + 1;
        const crystalLevel = this.empire.technologies[buildings.crystalMine].level + 1;
        const deuteriumLevel = this.empire.technologies[buildings.deuteriumSynthesizer].level + 1;
        const MetalProduction = MetalMine.getProduction(metalLevel, universeAccelerate);
        const CrystalProduction = CrystalMine.getProduction(crystalLevel, universeAccelerate);
        const DeuteriumProduction = DeuteriumSynthesizer.getProduction(deuteriumLevel, universeAccelerate, tAvg);

        //мало кристаллов
        if (
            MetalProduction * AIBuilder.resourcesProductionRelation.crystal > CrystalProduction
        ) {
            return CrystalMine;
        }
        //мало дейтерий
        else if (
            MetalProduction * AIBuilder.resourcesProductionRelation.deuterium > DeuteriumProduction
        ) {
            return DeuteriumSynthesizer;
        }
        //всё сбалансировано
        else {
            return MetalMine;
        }
    }

    think() {
        //something already builds
        if (this.empire.endBuildingSupply > 0) {
            const endBuildingTime = new Date(this.empire.endBuildingSupply);

            console.log(colors.yellow("Already building. Building Will end in" + endBuildingTime.toString()));
            return;
        }

        const entity = this.getNextBuildingId();
        const level = this.empire.technologies[entity.id].level;
        const cost = entity.getCost(level);


        if (this.canBuild(cost)) {
            console.log("build ", entity.id)
            this.action = {
                type: "build",
                id: entity.id
            };
        }
    }

    async act() {
        this.sense();
        this.think();

        if (this.action) {
            await super.act();
        }
    }
}

module.exports = AIBuilder;
