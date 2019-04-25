"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stage_default_1 = require("./stage.default");
const stage_0_1 = require("./stage.0");
const stage_0_5_1 = require("./stage.0_5");
const stage_1_1 = require("./stage.1");
const stage_1_3_1 = require("./stage.1_3");
const stage_1_6_1 = require("./stage.1_6");
const stage_2_1 = require("./stage.2");
const stage_2_3_1 = require("./stage.2_3");
const stage_2_6_1 = require("./stage.2_6");
const stage_3_1 = require("./stage.3");
const stage_3_3_1 = require("./stage.3_3");
const stage_3_6_1 = require("./stage.3_6");
const stage_4_1 = require("./stage.4");
const stage_4_2_1 = require("./stage.4_2");
const stage_4_4_1 = require("./stage.4_4");
const stage_4_6_1 = require("./stage.4_6");
const stage_4_8_1 = require("./stage.4_8");
const stage_5_1 = require("./stage.5");
const stage_5_1_1 = require("./stage.5_1");
const stage_5_2_1 = require("./stage.5_2");
class RoomStageController {
    static run(myRoom) {
        const room = Game.rooms[myRoom.name];
        if (myRoom.roomStage === -1) {
            stage_default_1.StageDefault.up(myRoom, room);
        }
        if (myRoom.roomStage === 0) {
            stage_0_1.Stage0.up(myRoom, room);
        }
        if (myRoom.roomStage === 0.5) {
            stage_0_5_1.Stage0_5.up(myRoom, room);
        }
        if (myRoom.roomStage === 1) {
            stage_1_1.Stage1.up(myRoom, room);
        }
        if (myRoom.roomStage === 1.3) {
            stage_1_3_1.Stage1_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 1.6) {
            stage_1_6_1.Stage1_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 2) {
            stage_2_1.Stage2.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.3) {
            stage_2_3_1.Stage2_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.6) {
            stage_2_6_1.Stage2_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 3) {
            stage_3_1.Stage3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.3) {
            stage_3_3_1.Stage3_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.6) {
            stage_3_6_1.Stage3_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 4) {
            stage_4_1.Stage4.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.2) {
            stage_4_2_1.Stage4_2.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.4) {
            stage_4_4_1.Stage4_4.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.6) {
            stage_4_6_1.Stage4_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.8) {
            stage_4_8_1.Stage4_8.up(myRoom, room);
        }
        if (myRoom.roomStage === 5) {
            stage_5_1.Stage5.up(myRoom, room);
        }
        if (myRoom.roomStage === 5.1) {
            stage_5_1_1.Stage5_1.up(myRoom, room);
        }
        if (myRoom.roomStage === 5.2) {
            stage_5_2_1.Stage5_2.up(myRoom, room);
        }
        if (myRoom.roomStage > 5.2) {
            stage_5_2_1.Stage5_2.down(myRoom, room);
        }
        if (myRoom.roomStage > 5.1) {
            stage_5_1_1.Stage5_1.down(myRoom, room);
        }
        if (myRoom.roomStage > 5) {
            stage_5_1.Stage5.down(myRoom, room);
        }
        if (myRoom.roomStage > 4.8) {
            stage_4_8_1.Stage4_8.down(myRoom, room);
        }
        if (myRoom.roomStage > 4.6) {
            stage_4_6_1.Stage4_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 4.4) {
            stage_4_4_1.Stage4_4.down(myRoom, room);
        }
        if (myRoom.roomStage > 4.2) {
            stage_4_2_1.Stage4_2.down(myRoom, room);
        }
        if (myRoom.roomStage > 4) {
            stage_4_1.Stage4.down(myRoom, room);
        }
        if (myRoom.roomStage > 3.6) {
            stage_3_6_1.Stage3_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 3.3) {
            stage_3_3_1.Stage3_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 3) {
            stage_3_1.Stage3.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.6) {
            stage_2_6_1.Stage2_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.3) {
            stage_2_3_1.Stage2_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 2) {
            stage_2_1.Stage2.down(myRoom, room);
        }
        if (myRoom.roomStage > 1.6) {
            stage_1_6_1.Stage1_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 1.3) {
            stage_1_3_1.Stage1_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 1) {
            stage_1_1.Stage1.down(myRoom, room);
        }
        if (myRoom.roomStage > 0.5) {
            stage_0_5_1.Stage0_5.down(myRoom, room);
        }
        if (myRoom.roomStage > 0) {
            stage_0_1.Stage0.down(myRoom, room);
        }
        if (myRoom.roomStage > -1) {
            stage_default_1.StageDefault.down(myRoom, room);
        }
    }
}
exports.RoomStageController = RoomStageController;
