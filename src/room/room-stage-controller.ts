import {StageDefault} from "./stages/stage-default";
import {Stage0} from "./stages/stage0";
import {Stage0_5} from "./stages/stage0_5";
import {Stage1} from "./stages/stage1";
import {Stage1_5} from "./stages/stage1_5";
import {Stage2_8} from "./stages/stage2_8";
import {Stage2} from "./stages/stage2";
import {Stage2_5} from "./stages/stage2_5";
import {Stage3} from "./stages/stage3";
import {Stage3_3} from "./stages/stage3_3";
import {Stage3_6} from "./stages/stage3_6";
import {Stage4} from "./stages/stage4";
import {Stage4_2} from "./stages/stage4_2";
import {Stage4_4} from "./stages/stage4_4";
import {Stage4_6} from "./stages/stage4_6";
import {Stage4_8} from "./stages/stage4_8";
import {Stage5} from "./stages/stage5";
import {Stage5_2} from "./stages/stage5_2";
import {Stage5_4} from "./stages/stage5_4";
import {Stage5_6} from "./stages/stage5_6";
import {Stage5_8} from "./stages/stage5_8";
import {Stage6} from "./stages/stage6";
import {Stage6_2} from "./stages/stage6_2";
import {Stage6_4} from "./stages/stage6_4";
import {Stage6_8} from "./stages/stage6_8";
import {Stage7} from "./stages/stage7";
import {Stage7_2} from "./stages/stage7_2";
import {Stage7_4} from "./stages/stage7_4";
import {Stage7_6} from "./stages/stage7_6";
import {Stage7_9} from "./stages/stage7_9";
import {Stage6_6} from "./stages/stage6_6";
import {Stage7_8} from "./stages/stage7_8";
import {Stage7_7} from "./stages/stage7_7";
import {Stage2_2} from "./stages/stage2_2";

export class RoomStageController {
    public static run(myRoom: MyRoom, room: Room): void {

        if (Game.time % 10 !== 0) {
            //Only run every 10 ticks
            return;
        }


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
        if (myRoom.roomStage === 1.5) {
            Stage1_5.up(myRoom, room);
        }
        if (myRoom.roomStage === 2) {
            Stage2.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.2) {
            Stage2_2.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.5) {
            Stage2_5.up(myRoom, room);
        }
        if (myRoom.roomStage === 2.8) {
            Stage2_8.up(myRoom, room);
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
        if (myRoom.roomStage === 6) {
            Stage6.up(myRoom, room);
        }
        if (myRoom.roomStage === 6.2) {
            Stage6_2.up(myRoom, room);
        }
        if (myRoom.roomStage === 6.4) {
            Stage6_4.up(myRoom, room);
        }
        if (myRoom.roomStage === 6.6) {
            Stage6_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 6.8) {
            Stage6_8.up(myRoom, room);
        }
        if (myRoom.roomStage === 7) {
            Stage7.up(myRoom, room);
        }
        if (myRoom.roomStage === 7.2) {
            Stage7_2.up(myRoom, room);
        }
        if (myRoom.roomStage === 7.4) {
            Stage7_4.up(myRoom, room);
        }
        if (myRoom.roomStage === 7.6) {
            Stage7_6.up(myRoom, room);
        }
        if (myRoom.roomStage === 7.7) {
            Stage7_7.up(myRoom, room);
        }
        if (myRoom.roomStage === 7.8) {
            Stage7_8.up(myRoom, room);
        }
        if (myRoom.roomStage === 7.9) {
            Stage7_9.up(myRoom, room);
        }

        //Downs
        if (myRoom.roomStage > 7.9) {
            Stage7_9.down(myRoom, room);
        }
        if (myRoom.roomStage > 7.8) {
            Stage7_8.down(myRoom, room);
        }
        if (myRoom.roomStage > 7.7) {
            Stage7_7.down(myRoom, room);
        }
        if (myRoom.roomStage > 7.6) {
            Stage7_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 7.4) {
            Stage7_4.down(myRoom, room);
        }
        if (myRoom.roomStage > 7.2) {
            Stage7_2.down(myRoom, room);
        }
        if (myRoom.roomStage > 7) {
            Stage7.down(myRoom, room);
        }
        if (myRoom.roomStage > 6.8) {
            Stage6_8.down(myRoom, room);
        }
        if (myRoom.roomStage > 6.6) {
            Stage6_6.down(myRoom, room);
        }
        if (myRoom.roomStage > 6.4) {
            Stage6_4.down(myRoom, room);
        }
        if (myRoom.roomStage > 6.2) {
            Stage6_2.down(myRoom, room);
        }
        if (myRoom.roomStage > 6) {
            Stage6.down(myRoom, room);
        }
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
        if (myRoom.roomStage > 1.6) {
            Stage2_8.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.6) {
            Stage2_5.down(myRoom, room);
        }
        if (myRoom.roomStage > 2.3) {
            Stage2_2.down(myRoom, room);
        }
        if (myRoom.roomStage > 2) {
            Stage2.down(myRoom, room);
        }
        if (myRoom.roomStage > 1.3) {
            Stage1_5.down(myRoom, room);
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
