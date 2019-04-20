"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const live_spawn_claimer_1 = require("live.spawn.claimer");
const live_spawn_laborer_1 = require("live.spawn.laborer");
exports.liveController = {
    run: function () {
        live_spawn_claimer_1.liveSpawnClaimers.run();
        live_spawn_laborer_1.liveSpawnLaborers.run();
    }
};
