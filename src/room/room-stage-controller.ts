import { StageDefault } from "./stages/stage-default";
import { Stage0 } from "./stages/stage0";
import { Stage0_5 } from "./stages/stage0_5";
import { Stage1 } from "./stages/stage1";
import { Stage1_3 } from "./stages/stage1_3";
import { Stage1_6 } from "./stages/stage1_6";
import { Stage2 } from "./stages/stage2";
import { Stage2_3 } from "./stages/stage2_3";
import { Stage2_6 } from "./stages/stage2_6";
import { Stage3 } from "./stages/stage3";
import { Stage3_3 } from "./stages/stage3_3";
import { Stage3_6 } from "./stages/stage3_6";
import { Stage4 } from "./stages/stage4";
import { Stage4_2 } from "./stages/stage4_2";
import { Stage4_4 } from "./stages/stage4_4";
import { Stage4_6 } from "./stages/stage4_6";
import { Stage4_8 } from "./stages/stage4_8";
import { Stage5 } from "./stages/stage5";
import { Stage5_2 } from "./stages/stage5_2";
import { Stage5_4 } from "./stages/stage5_4";
import { Stage5_6 } from "./stages/stage5_6";
import { Stage5_8 } from "./stages/stage5_8";

export class RoomStageController {
    public static run(myRoom: MyRoom): void {
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
            cont
            tower-1 to 6
            storage
            link
            link-bank
            spawn

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

            5   ->  5.2 : RCL is level >= 6
            5   <-  5.2 : RCL is level < 6

            5.2 ->  5.4 : Room has 3 links
            5.2 <-  5.4 : Room has < 3 links

            5.4 ->  5.6 : Room has >= 40 extensions
            5.4 <-  5.6 : Room has < 40 extensions

            5.6 ->  5.8 : Room has extractor
            5.6 <-  5.8 : Room has no extractor

            5.8 ->  5.9 : Room has extractor
            5.8 <-  5.9 : Room has no extractor

            5.9 ->  6   : Room has >= 3 labs
            5.9 <-  6   : Room has < 3 labs
         */

        //Ups
        if (myRoom.roomStage === -1) {
            StageDefault.up(myRoom, room);
        }
        if (myRoom.roomStage === 0) {
            Stage0.up(myRoom, room);
        }
        if (myRoom.roomStage === 0.5) {
            Stage0_5.up(myRoom, room);
        }
        if (myRoom.roomStage === 1) {
            Stage1.up(myRoom, room);
        }
        if (myRoom.roomStage === 1.3) {
            Stage1_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 1.6) {
            Stage1_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 2) {
            Stage2.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.3) {
            Stage2_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.6) {
            Stage2_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 3) {
            Stage3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.3) {
            Stage3_3.up(myRoom, room);
        }
        if (myRoom.roomStage === 3.6) {
            Stage3_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 4) {
            Stage4.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.2) {
            Stage4_2.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.4) {
            Stage4_4.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.6) {
            Stage4_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 4.8) {
            Stage4_8.up(myRoom, room);
        }
        if (myRoom.roomStage === 5) {
            Stage5.up(myRoom, room);
        }
        if (myRoom.roomStage === 5.2) {
            Stage5_2.up(myRoom, room);
        }
        if (myRoom.roomStage === 5.4) {
            Stage5_4.up(myRoom, room);
        }
        if (myRoom.roomStage === 5.6) {
            Stage5_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 5.8) {
            Stage5_8.up(myRoom, room);
        }
        //TODO: 5.9

        //Downs
        if (myRoom.roomStage > 5.8) {
            Stage5_8.down(myRoom, room);
        }
        if (myRoom.roomStage > 5.6) {
            Stage5_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 5.4) {
            Stage5_4.down(myRoom, room);
        }
        if (myRoom.roomStage > 5.2) {
            Stage5_2.down(myRoom, room);
        }
        if (myRoom.roomStage > 5) {
            Stage5.down(myRoom, room);
        }
        if (myRoom.roomStage > 4.8) {
            Stage4_8.down(myRoom, room);
        }
        if (myRoom.roomStage > 4.6) {
            Stage4_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 4.4) {
            Stage4_4.down(myRoom, room);
        }
        if (myRoom.roomStage > 4.2) {
            Stage4_2.down(myRoom, room);
        }
        if (myRoom.roomStage > 4) {
            Stage4.down(myRoom, room);
        }
        if (myRoom.roomStage > 3.6) {
            Stage3_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 3.3) {
            Stage3_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 3) {
            Stage3.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.6) {
            Stage2_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.3) {
            Stage2_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 2) {
            Stage2.down(myRoom, room);
        }
        if (myRoom.roomStage > 1.6) {
            Stage1_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 1.3) {
            Stage1_3.down(myRoom, room);
        }
        if (myRoom.roomStage > 1) {
            Stage1.down(myRoom, room);
        }
        if (myRoom.roomStage > 0.5) {
            Stage0_5.down(myRoom, room);
        }
        if (myRoom.roomStage > 0) {
            Stage0.down(myRoom, room);
        }
        if (myRoom.roomStage > -1) {
            StageDefault.down(myRoom, room);
        }
    }
}
