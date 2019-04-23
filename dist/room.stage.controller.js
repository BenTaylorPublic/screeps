"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stage_default_1 = require("stage.default");
const stage_0_1 = require("stage.0");
const stage_0_5_1 = require("stage.0_5");
const stage_1_1 = require("stage.1");
const stage_1_3_1 = require("stage.1_3");
const stage_1_6_1 = require("stage.1_6");
const stage_2_1 = require("stage.2");
const stage_2_3_1 = require("stage.2_3");
const stage_2_6_1 = require("stage.2_6");
const stage_3_1 = require("stage.3");
const stage_3_3_1 = require("stage.3_3");
const stage_3_6_1 = require("stage.3_6");
const stage_4_1 = require("stage.4");
const stage_4_2_1 = require("stage.4_2");
const stage_4_4_1 = require("stage.4_4");
class RoomStageController {
    static run(myRoom) {
        const room = Game.rooms[myRoom.name];
        /*

            RCL LEVELS:
            Lvl Req         Other                   Towers  Links   Spawns  Extensions  Ramparts Labs
            1	200	        Roads, 5 Containers                     1
            2	45,000	    Walls                                           5 50 cap    300K
            3	135,000	                            1                       10 50 cap   1M
            4	405,000	    Storage                                         20 50 cap   3M
            5	1,215,000	                        2       2               30 50 cap   10M
            6	3,645,000	Extractor, Terminal             3               40 50 cap   30M     3
            7	10,935,000	                        3       4       2       50 100 cap  100M    6
            8	-	        Observer, Power Spawn   6       6       3       60 200 cap  300M    10

            Flag names:
            ex-1 to 60
            cont-1 cont-2
            tower-1 to 6
            storage
            link-1 to 2 & link-bank
            spawn-1 to 3

            Loosely based on RCL
            -1 is default room level

            -1  ->  0   : Get a room controller that's mine
            -1  <-  0   : Have no room controller that's mine

            0   ->  0.5 : RCL is level >= 1
            0   <-  0.5 : RCL is level < 1

            0.5 ->  1   : Room has >= 1 spawn
            0.5 <-  1   : Room has < 1 spawns

            1   ->  1.3 : RCL is level >= 2
            1   <-  1.3 : RCL is level < 2

            1.3 ->  1.6 : Room has >= 5 extensions
            1.3 <-  1.6 : Room has < 5 extensions

            1.6 ->  2   : Room has caches length >= source amount
            1.6 <-  2   : Room has caches length < source amount

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

            4   ->  4.2 : RCL is level >= 5
            4   <-  4.2 : RCL is level < 5

            4.2 ->  4.4 : Room has >= 2 tower
            4.2 <-  4.4 : Room has < 2 tower

            4.4 ->  4.6 : Room has >= 30 extensions
            4.4 <-  4.6 : Room has < 30 extensions

            4.6 ->  4.8 : Room has 2 links
            4.6 <-  4.8 : Room has < 2 links

            4.8 ->  5   : Room has 1 sources using links, no cache or hauler
            4.8 <-  5   : Room has 0 sources using links, no cache or hauler
         */
        //Ups
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
        //Downs
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
