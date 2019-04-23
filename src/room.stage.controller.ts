import { stageDefault } from "stage.default";
import { stage0 } from "stage.0";
import { stage0_5 } from "stage.0_5";
import { stage1 } from "stage.1";
import { stage1_3 } from "stage.1_3";
import { stage1_6 } from "stage.1_6";
import { stage2 } from "stage.2";
import { stage2_3 } from "stage.2_3";
import { stage2_6 } from "stage.2_6";
import { stage3 } from "stage.3";
import { stage3_3 } from "stage.3_3";
import { stage3_6 } from "stage.3_6";
import { stage4 } from "stage.4";
import { stage4_2 } from "stage.4_2";
import { stage4_4 } from "stage.4_4";

export class RoomStageController {
    public static run(myRoom: MyRoom) {
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
            stageDefault.up(myRoom, room);
        }
        if (myRoom.roomStage === 0) {
            stage0.up(myRoom, room);
        }
        if (myRoom.roomStage === 0.5) {
            stage0_5.up(myRoom, room);
        }
        if (myRoom.roomStage === 1) {
            stage1.up(myRoom, room);
        }
        if (myRoom.roomStage === 1.3) {
            stage1_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 1.6) {
            stage1_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 2) {
            stage2.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.3) {
            stage2_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.6) {
            stage2_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 3) {
            stage3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.3) {
            stage3_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.6) {
            stage3_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 4) {
            stage4.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.2) {
            stage4_2.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.4) {
            stage4_4.up(myRoom, room);
        }

        //Downs
        if (myRoom.roomStage > 4.4) {
            stage4_4.down(myRoom, room);
        }
        if (myRoom.roomStage > 4.2) {
            stage4_2.down(myRoom, room);
        }
        if (myRoom.roomStage > 4) {
            stage4.down(myRoom, room);
        }
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
        if (myRoom.roomStage > 1.6) {
            stage1_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 1.3) {
            stage1_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 1) {
            stage1.down(myRoom, room);
        }
        if (myRoom.roomStage > 0.5) {
            stage0_5.down(myRoom, room);
        }
        if (myRoom.roomStage > 0) {
            stage0.down(myRoom, room);
        }
        if (myRoom.roomStage > -1) {
            stageDefault.down(myRoom, room);
        }
    }
}
