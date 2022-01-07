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

    sense() {
    }

    think() {
        //something already builds
        if (this.empire.endBuildingSupply > 0) {
            const endBuildingTime = new Date(this.empire.endBuildingSupply);

            console.log(colors.yellow("Already builds another building. Building Will end in" + endBuildingTime.toString()));
            return;
        }

        const universeAccelerate = 8;
        const tAvg = -7;
        let nextBuildingCost = {
            metal: 0,
            crystal: 0,
            deuterium: 0,
        }
        let nextBuildingId;

        //решить проблемы с подачей энергии
        if (this.empire.resources.energy < 0) {
            //todo: выбор электростанции должен получаться из рассчёта стоимости одной единицы энергии
            const solarPlantLevel = this.empire.technologies[buildings.solarPlant].level + 1;
            nextBuildingCost = SolarPlant.getCost(solarPlantLevel);
            nextBuildingId = buildings.solarPlant;
        }
        // строить новые мощности
        else {
            //улучшить шахту
            const metalLevel = this.empire.technologies[buildings.metalMine].level + 1;
            const crystalLevel = this.empire.technologies[buildings.crystalMine].level + 1;
            const deuteriumLevel = this.empire.technologies[buildings.deuteriumSynthesizer].level + 1;

            console.log("Mine levels", {metalLevel, crystalLevel, deuteriumLevel})

            const metalMineStats = MetalMine.getStats(metalLevel, universeAccelerate);
            const crystalMineStats = CrystalMine.getStats(crystalLevel, universeAccelerate);
            const deuteriumSynthesizerStats = DeuteriumSynthesizer.getStats(deuteriumLevel, universeAccelerate, tAvg);
            const {cost: MetalMineCost, production: MetalProduction} = metalMineStats;
            const {cost: CrystalMineCost, production: CrystalProduction} = crystalMineStats;
            const {cost: DeuteriumSynthesizerCost, production: DeuteriumProduction} = deuteriumSynthesizerStats;

            console.log("Productions", {MetalProduction, CrystalProduction, DeuteriumProduction})

            //мало кристаллов
            if (
                MetalProduction * AIBuilder.resourcesProductionRelation.crystal > CrystalProduction
            ) {
                nextBuildingCost.metal = CrystalMineCost.metal;
                nextBuildingCost.crystal = CrystalMineCost.crystal;
                nextBuildingId = buildings.crystalMine;
            }
            //мало дейтерий
            else if (
                MetalProduction * AIBuilder.resourcesProductionRelation.deuterium > DeuteriumProduction
            ) {
                nextBuildingCost.metal = DeuteriumSynthesizerCost.metal;
                nextBuildingCost.crystal = DeuteriumSynthesizerCost.crystal;
                nextBuildingId = buildings.deuteriumSynthesizer;
            }
            //всё сбалансировано
            else {
                nextBuildingCost.metal = MetalMineCost.metal;
                nextBuildingCost.crystal = MetalMineCost.crystal;
                nextBuildingId = buildings.metalMine;
            }
        }


        //проверить возможность строительства
        const metalStorageLevel = this.empire.technologies[buildings.metalStorage] + 1;
        const crystalStorageLevel = this.empire.technologies[buildings.crystalStorage] + 1;
        const deuteriumTankLevel = this.empire.technologies[buildings.deuteriumTank] + 1;

        //не хватает металла
        if (nextBuildingCost.metal && this.empire.resources.metal < nextBuildingCost.metal) {
            if (MetalStorage.getCapacity(metalStorageLevel) < nextBuildingCost.metal) {
                nextBuildingId = buildings.metalStorage;
            } else {
                nextBuildingId = null;
            }
        }
        //не хватает кристаллов
        else if (nextBuildingCost.crystal && this.empire.resources.crystal < nextBuildingCost.crystal) {
            if (CrystalStorage.getCapacity(crystalStorageLevel) < nextBuildingCost.crystal) {
                nextBuildingId = buildings.crystalStorage;
            } else {
                nextBuildingId = null;
            }
        }
        //не хватает дейтерия
        else if (nextBuildingCost.deuterium && this.empire.resources.deuterium < nextBuildingCost.deuterium) {
            if (DeuteriumTank.getCapacity(deuteriumTankLevel) < nextBuildingCost.deuterium) {
                nextBuildingId = buildings.deuteriumTank;
            } else {
                nextBuildingId = null;
            }
        }

        if (nextBuildingId === null) {
            console.log(colors.yellow("Insufficient resources for building"));
            return;
        }

        this.action = {
            type: "build",
            id: nextBuildingId
        };

        console.log(colors.green(`Build ${nextBuildingId}`), nextBuildingCost);
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
