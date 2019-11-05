import {Profiler, ProfilerData} from "./profiler";
import {RoleLaborer} from "../room/roles/laborer";
import {RoleAttackCreep} from "../empire/role/attack-creep";
import {RoleClaimer} from "../empire/role/claimer";
import {EmpireController} from "../empire/empire-controller";
import {AttackController} from "../empire/attack-controller";
import {AttackHelperFunctions} from "../empire/attack-helper-functions";
import {AttackPressureController} from "../empire/attack-pressure-controller";
import {AttackQuickController} from "../empire/attack-quick-controller";
import {SpawnClaimerController} from "../empire/spawn-claimer-controller";
import {HelperFunctions} from "../global/helper-functions";
import {ReportController} from "../reporting/report-controller";
import {RoleBankLinker} from "../room/roles/bank-linker";
import {RoleHauler} from "../room/roles/hauler";
import {RoleMiner} from "../room/roles/miner";
import {RoomSpawnController} from "../room/spawns/room-spawn-controller";
import {SpawnBankLinker} from "../room/spawns/spawn-bank-linker";
import {SpawnHauler} from "../room/spawns/spawn-hauler";
import {SpawnLaborer} from "../room/spawns/spawn-laborer";
import {SpawnMiner} from "../room/spawns/spawn-miner";
import {Stage0} from "../room/stages/stage0";
import {Stage0_5} from "../room/stages/stage0_5";
import {Stage1} from "../room/stages/stage1";
import {Stage1_3} from "../room/stages/stage1_3";
import {Stage1_6} from "../room/stages/stage1_6";
import {Stage2} from "../room/stages/stage2";
import {Stage2_3} from "../room/stages/stage2_3";
import {Stage2_6} from "../room/stages/stage2_6";
import {Stage3} from "../room/stages/stage3";
import {Stage3_3} from "../room/stages/stage3_3";
import {Stage3_6} from "../room/stages/stage3_6";
import {Stage4} from "../room/stages/stage4";
import {Stage4_2} from "../room/stages/stage4_2";
import {Stage4_4} from "../room/stages/stage4_4";
import {Stage4_6} from "../room/stages/stage4_6";
import {Stage4_8} from "../room/stages/stage4_8";
import {Stage5} from "../room/stages/stage5";
import {Stage5_2} from "../room/stages/stage5_2";
import {Stage5_4} from "../room/stages/stage5_4";
import {Stage5_6} from "../room/stages/stage5_6";
import {Stage5_8} from "../room/stages/stage5_8";
import {StageDefault} from "../room/stages/stage-default";
import {StageFunctions} from "../room/stages/stage-functions";
import {RoomSourceLinkController} from "../room/structures/source-link";
import {RoomTowerController} from "../room/structures/tower";
import {RoomController} from "../room/room-controller";
import {RoomStageController} from "../room/room-stage-controller";
import {ScheduleController} from "../schedule/schedule-controller";

export class ProfilerWrapper {
    public static setup(): void {
        Profiler.setup(RoleAttackCreep, "RoleAttackCreep");
        Profiler.setup(RoleClaimer, "RoleClaimer");

        Profiler.setup(AttackController, "AttackController");
        Profiler.setup(AttackHelperFunctions, "AttackHelperFunctions");
        Profiler.setup(AttackPressureController, "AttackPressureController");
        Profiler.setup(AttackQuickController, "AttackQuickController");
        Profiler.setup(EmpireController, "EmpireController");
        Profiler.setup(SpawnClaimerController, "SpawnClaimerController");

        Profiler.setup(HelperFunctions, "HelperFunctions");

        Profiler.setup(ReportController, "ReportController");

        Profiler.setup(RoleBankLinker, "RoleBankLinker");
        Profiler.setup(RoleHauler, "RoleHauler");
        Profiler.setup(RoleLaborer, "RoleLaborer");
        Profiler.setup(RoleMiner, "RoleMiner");

        Profiler.setup(RoomSpawnController, "RoomSpawnController");
        Profiler.setup(SpawnBankLinker, "SpawnBankLinker");
        Profiler.setup(SpawnHauler, "SpawnHauler");
        Profiler.setup(SpawnLaborer, "SpawnLaborer");
        Profiler.setup(SpawnMiner, "SpawnMiner");

        Profiler.setup(Stage0, "Stage0");
        Profiler.setup(Stage0_5, "Stage0_5");
        Profiler.setup(Stage1, "Stage1");
        Profiler.setup(Stage1_3, "Stage1_3");
        Profiler.setup(Stage1_6, "Stage1_6");
        Profiler.setup(Stage2, "Stage2");
        Profiler.setup(Stage2_3, "Stage2_3");
        Profiler.setup(Stage2_6, "Stage2_6");
        Profiler.setup(Stage3, "Stage3");
        Profiler.setup(Stage3_3, "Stage3_3");
        Profiler.setup(Stage3_6, "Stage3_6");
        Profiler.setup(Stage4, "Stage4");
        Profiler.setup(Stage4_2, "Stage4_2");
        Profiler.setup(Stage4_4, "Stage4_4");
        Profiler.setup(Stage4_6, "Stage4_6");
        Profiler.setup(Stage4_8, "Stage4_8");
        Profiler.setup(Stage5, "Stage5");
        Profiler.setup(Stage5_2, "Stage5_2");
        Profiler.setup(Stage5_4, "Stage5_4");
        Profiler.setup(Stage5_6, "Stage5_6");
        Profiler.setup(Stage5_8, "Stage5_8");
        Profiler.setup(StageDefault, "StageDefault");
        Profiler.setup(StageFunctions, "StageFunctions");

        Profiler.setup(RoomSourceLinkController, "RoomSourceLinkController");
        Profiler.setup(RoomTowerController, "RoomTowerController");

        Profiler.setup(RoomController, "RoomController");
        Profiler.setup(RoomStageController, "RoomStageController");

        Profiler.setup(ScheduleController, "ScheduleController");
    }

    public static clearProfilingData(): void {
        //Clear all profiling on setup
        Memory.profiler = {
            startTick: Game.time
        } as ProfilerData;
    }

    public static detectProfileReport(): void {
        if (Game.time % 10 !== 0 ||
            Game.flags["profile-report"] == null) {
            return;
        }

        //Format the data
        //TODO:
    }
}