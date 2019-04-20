import { stageDefault } from "stage.default";
import { stage0 } from "stage.0";
import { stage0_3 } from "stage.0_3";
import { stage0_6 } from "stage.0_6";
import { stage1 } from "stage.1";
import { stage1_5 } from "stage.1_5";
import { stage2 } from "stage.2";
import { stage2_3 } from "stage.2_3";
import { stage2_6 } from "stage.2_6";
import { stage3 } from "stage.3";
import { stage3_3 } from "stage.3_3";
import { stage3_6 } from "stage.3_6";

export const roomStageController: any = {
    run: function (myRoom: MyRoom) {
        const room: Room = Game.rooms[myRoom.name];

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
            stageDefault.step(myRoom, room);
            stageDefault.up(myRoom, room);
        }
        if (myRoom.roomStage === 0) {
            stage0.step(myRoom, room);
            stage0.up(myRoom, room);
        }
        if (myRoom.roomStage === 0.3) {
            stage0_3.step(myRoom, room);
            stage0_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 0.6) {
            stage0_6.step(myRoom, room);
            stage0_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 1) {
            stage1.step(myRoom, room);
            stage1.up(myRoom, room);
        }
        if (myRoom.roomStage === 1.5) {
            stage1_5.step(myRoom, room);
            stage1_5.up(myRoom, room);
        }
        if (myRoom.roomStage === 2) {
            stage2.step(myRoom, room);
            stage2.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.3) {
            stage2_3.step(myRoom, room);
            stage2_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.6) {
            stage2_6.step(myRoom, room);
            stage2_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 3) {
            stage3.step(myRoom, room);
            stage3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.3) {
            stage3_3.step(myRoom, room);
            stage3_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.6) {
            stage3_6.step(myRoom, room);
            stage3_6.up(myRoom, room);
        }

        //Downs
        if (myRoom.roomStage > 3.6) {
            stage3_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 3.3) {
            stage3_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 3) {
            stage3.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.6) {
            stage2_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.3) {
            stage2_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 2) {
            stage2.down(myRoom, room);
        }
        if (myRoom.roomStage > 1.5) {
            stage1_5.down(myRoom, room);
        }
        if (myRoom.roomStage > 1) {
            stage1.down(myRoom, room);
        }
        if (myRoom.roomStage > 0.6) {
            stage0_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 0.3) {
            stage0_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 0) {
            stage0.down(myRoom, room);
        }
        if (myRoom.roomStage > -1) {
            stageDefault.down(myRoom, room);
        }
    }
};
