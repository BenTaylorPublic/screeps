"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const live_spawn_claimer_1 = require("./live.spawn.claimer");
class LiveController {
    static run() {
        live_spawn_claimer_1.LiveSpawnClaimer.run();
    }
}
exports.LiveController = LiveController;
