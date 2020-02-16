import {StageDefault} from "./stages/stage-default";
import {Stage0} from "./stages/stage0";
import {Stage0_5} from "./stages/stage0_5";
import {Stage1} from "./stages/stage1";
import {Stage1_3} from "./stages/stage1_3";
import {Stage1_6} from "./stages/stage1_6";
import {Stage2} from "./stages/stage2";
import {Stage2_3} from "./stages/stage2_3";
import {Stage2_6} from "./stages/stage2_6";
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
import {Stage6_25} from "./stages/Stage6_25";
import {Stage6_5} from "./stages/stage6_5";
import {Stage6_75} from "./stages/stage6_75";
import {Stage7} from "./stages/stage7";
import {Stage7_2} from "./stages/stage7_2";
import {Stage7_4} from "./stages/stage7_4";
import {Stage7_6} from "./stages/stage7_6";

export class RoomStageController {
    public static run(myRoom: MyRoom): void {

        if (Game.time % 10 !== 0) {
            //Only run every 10 ticks
            return;
        }

        const room: Room = Game.rooms[myRoom.name];

        //Ups
        if (myRoom.roomStage === -1) {
            StageDefault.up(myRoom, room);
        } else if (myRoom.roomStage === 0) {
            Stage0.up(myRoom, room);
        } else if (myRoom.roomStage === 0.5) {
            Stage0_5.up(myRoom, room);
        } else if (myRoom.roomStage === 1) {
            Stage1.up(myRoom, room);
        } else if (myRoom.roomStage === 1.3) {
            Stage1_3.up(myRoom, room);
        } else if (myRoom.roomStage === 1.6) {
            Stage1_6.up(myRoom, room);
        } else if (myRoom.roomStage === 2) {
            Stage2.up(myRoom, room);
        } else if (myRoom.roomStage === 2.3) {
            Stage2_3.up(myRoom, room);
        } else if (myRoom.roomStage === 2.6) {
            Stage2_6.up(myRoom, room);
        } else if (myRoom.roomStage === 3) {
            Stage3.up(myRoom, room);
        } else if (myRoom.roomStage === 3.3) {
            Stage3_3.up(myRoom, room);
        } else if (myRoom.roomStage === 3.6) {
            Stage3_6.up(myRoom, room);
        } else if (myRoom.roomStage === 4) {
            Stage4.up(myRoom, room);
        } else if (myRoom.roomStage === 4.2) {
            Stage4_2.up(myRoom, room);
        } else if (myRoom.roomStage === 4.4) {
            Stage4_4.up(myRoom, room);
        } else if (myRoom.roomStage === 4.6) {
            Stage4_6.up(myRoom, room);
        } else if (myRoom.roomStage === 4.8) {
            Stage4_8.up(myRoom, room);
        } else if (myRoom.roomStage === 5) {
            Stage5.up(myRoom, room);
        } else if (myRoom.roomStage === 5.2) {
            Stage5_2.up(myRoom, room);
        } else if (myRoom.roomStage === 5.4) {
            Stage5_4.up(myRoom, room);
        } else if (myRoom.roomStage === 5.6) {
            Stage5_6.up(myRoom, room);
        } else if (myRoom.roomStage === 5.8) {
            Stage5_8.up(myRoom, room);
        } else if (myRoom.roomStage === 6) {
            Stage6.up(myRoom, room);
        } else if (myRoom.roomStage === 6.25) {
            Stage6_25.up(myRoom, room);
        } else if (myRoom.roomStage === 6.5) {
            Stage6_5.up(myRoom, room);
        } else if (myRoom.roomStage === 6.75) {
            Stage6_75.up(myRoom, room);
        } else if (myRoom.roomStage === 7) {
            Stage7.up(myRoom, room);
        } else if (myRoom.roomStage === 7.2) {
            Stage7_2.up(myRoom, room);
        } else if (myRoom.roomStage === 7.4) {
            Stage7_4.up(myRoom, room);
        } else if (myRoom.roomStage === 7.6) {
            Stage7_6.up(myRoom, room);
        }

        //Downs
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
        if (myRoom.roomStage > 6.75) {
            Stage6_75.down(myRoom, room);
        }
        if (myRoom.roomStage > 6.5) {
            Stage6_5.down(myRoom, room);
        }
        if (myRoom.roomStage > 6.25) {
            Stage6_25.down(myRoom, room);
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
