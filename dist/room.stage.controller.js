"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stage_default_1 = require("stage.default");
const stage_0_1 = require("stage.0");
const stage_0_3_1 = require("stage.0_3");
const stage_0_6_1 = require("stage.0_6");
const stage_1_1 = require("stage.1");
const stage_1_5_1 = require("stage.1_5");
const stage_2_1 = require("stage.2");
const stage_2_3_1 = require("stage.2_3");
const stage_2_6_1 = require("stage.2_6");
const stage_3_1 = require("stage.3");
const stage_3_3_1 = require("stage.3_3");
const stage_3_6_1 = require("stage.3_6");
exports.roomStageController = {
    run: function (myRoom) {
        const room = Game.rooms[myRoom.name];
        /*
            Loosely based on RCL
            -1 is default room level

            -1  ->  0   : Get a room controller that's mine
            -1  <-  0   : Have no room controller that's mine

            0   ->  0.3 : RCL is level >= 1
            0   <-  0.3 : RCL is level < 1

            0.3 ->  0.6 : Room has >= 1 spawn
            0.3 <-  0.6 : Room has < 1 spawns

            0.6 ->  1   : Room has caches length >= source amount
            0.6 <-  1   : Room has caches length < source amount

            1   ->  1.5 : RCL is level >= 2
            1   <-  1.5 : RCL is level < 2

            1.5 ->  2   : Room has >= 5 extensions
            1.5 <-  2   : Room has < 5 extensions

            2   ->  2.3 : RCL is level >= 3
            2   <-  2.3 : RCL is level < 3

            2.3 ->  2.6 : Room has >= 1 tower
            2.3 <-  2.6 : Room has < 1 tower

            2.6 ->  3   : Room has >= 10 extensions
            2.6 <-  3   : Room has < 10 extensions

            3   ->  3.3 : RCL is level >= 4
            3   <-  3.3 : RCL is level < 4

            3.3 ->  3.6 : Room has >= 20 extensions
            3.3 <-  3.6 : Room has < 20 extensions

            3.6 ->  4   : Room has a storage bank
            3.6 <-  4   : Room does not have a storage bank
         */
        //Ups
        if (myRoom.roomStage === -1) {
            stage_default_1.stageDefault.step(myRoom, room);
            stage_default_1.stageDefault.up(myRoom, room);
        }
        if (myRoom.roomStage === 0) {
            stage_0_1.stage0.step(myRoom, room);
            stage_0_1.stage0.up(myRoom, room);
        }
        if (myRoom.roomStage === 0.3) {
            stage_0_3_1.stage0_3.step(myRoom, room);
            stage_0_3_1.stage0_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 0.6) {
            stage_0_6_1.stage0_6.step(myRoom, room);
            stage_0_6_1.stage0_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 1) {
            stage_1_1.stage1.step(myRoom, room);
            stage_1_1.stage1.up(myRoom, room);
        }
        if (myRoom.roomStage === 1.5) {
            stage_1_5_1.stage1_5.step(myRoom, room);
            stage_1_5_1.stage1_5.up(myRoom, room);
        }
        if (myRoom.roomStage === 2) {
            stage_2_1.stage2.step(myRoom, room);
            stage_2_1.stage2.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.3) {
            stage_2_3_1.stage2_3.step(myRoom, room);
            stage_2_3_1.stage2_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.6) {
            stage_2_6_1.stage2_6.step(myRoom, room);
            stage_2_6_1.stage2_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 3) {
            stage_3_1.stage3.step(myRoom, room);
            stage_3_1.stage3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.3) {
            stage_3_3_1.stage3_3.step(myRoom, room);
            stage_3_3_1.stage3_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.6) {
            stage_3_6_1.stage3_6.step(myRoom, room);
            stage_3_6_1.stage3_6.up(myRoom, room);
        }
        //Downs
        if (myRoom.roomStage > 3.6) {
            stage_3_6_1.stage3_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 3.3) {
            stage_3_3_1.stage3_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 3) {
            stage_3_1.stage3.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.6) {
            stage_2_6_1.stage2_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.3) {
            stage_2_3_1.stage2_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 2) {
            stage_2_1.stage2.down(myRoom, room);
        }
        if (myRoom.roomStage > 1.5) {
            stage_1_5_1.stage1_5.down(myRoom, room);
        }
        if (myRoom.roomStage > 1) {
            stage_1_1.stage1.down(myRoom, room);
        }
        if (myRoom.roomStage > 0.6) {
            stage_0_6_1.stage0_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 0.3) {
            stage_0_3_1.stage0_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 0) {
            stage_0_1.stage0.down(myRoom, room);
        }
        if (myRoom.roomStage > -1) {
            stage_default_1.stageDefault.down(myRoom, room);
        }
    }
};
