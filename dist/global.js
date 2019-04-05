"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.global = {
    getId: function () {
        const toReturn = Memory.myMemory.globalId;
        Memory.myMemory.globalId++;
        return toReturn;
    },
    calcBodyCost: function (body) {
        return body.reduce(function (cost, part) {
            return cost + BODYPART_COST[part];
        }, 0);
    }
};
