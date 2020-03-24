import {Profiler, ProfilerRawData, ProfilerRawDataClass} from "./profiler";
import {RoleLaborer} from "../room/roles/laborer";
import {RoleAttackCreep} from "../empire/role/attack-creep";
import {RoleClaimer} from "../empire/role/claimer";
import {EmpireController} from "../empire/empire-controller";
import {AttackController} from "../empire/attack/attack-controller";
import {AttackHelperFunctions} from "../empire/attack/attack-helper-functions";
import {AttackPressureController} from "../empire/attack/attack-pressure-controller";
import {AttackQuickController} from "../empire/attack/attack-quick-controller";
import {SpawnClaimerController} from "../empire/spawn-claimer-controller";

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
import {Stage6_75} from "../room/stages/stage6_75";
import {Stage7_6} from "../room/stages/stage7_6";
import {Stage7_8} from "../room/stages/stage7_8";
import {Stage7_2} from "../room/stages/stage7_2";
import {Stage6} from "../room/stages/stage6";
import {Stage6_5} from "../room/stages/stage6_5";
import {Stage7_4} from "../room/stages/stage7_4";
import {Stage6_25} from "../room/stages/stage6_25";
import {Stage7} from "../room/stages/stage7";
import {BuildObserverController} from "../empire/observer/build-observer-controller";
import {PowerScavController} from "../empire/power-scav-controller";
import {ObserverController} from "../empire/observer/observer-controller";
import {MemoryController} from "../memory/memory-controller";
import {RolePowerScavAttackCreep} from "../empire/role/power-scav-attack-creep";
import {RolePowerScavHaulCreep} from "../empire/role/power-scav-haul-creep";
import {SpawnQueueController} from "../global/spawn-queue-controller";
import {CreepHelper} from "../global/helpers/creep-helper";
import {RoomHelper} from "../global/helpers/room-helper";
import {LogHelper} from "../global/helpers/log-helper";
import {MovementHelper} from "../global/helpers/movement-helper";
import {MapHelper} from "../global/helpers/map-helper";
import {FlagHelper} from "../global/helpers/flag-helper";
import {EmpireHelper} from "../global/helpers/empire-helper";
import {ScavengeController} from "../empire/scavenge-controller";
import {RoleScavenger} from "../empire/role/scavenger";
import {AttackHealerDrainController} from "../empire/attack/attack-healer-drain-controller";
import {SignController} from "../empire/sign/sign-controller";
import {RoleStocker} from "../room/roles/stocker";
import {SpawnStocker} from "../room/spawns/spawn-stocker";
import {RoomDefenseController} from "../room/room-defense-controller";

export class ProfilerWrapper {
    public static setup(): void {
        Profiler.setup(AttackController, "AttackController");
        Profiler.setup(AttackHealerDrainController, "AttackHealerDrainController");
        Profiler.setup(AttackHelperFunctions, "AttackHelperFunctions");
        Profiler.setup(AttackPressureController, "AttackPressureController");
        Profiler.setup(AttackQuickController, "AttackQuickController");

        Profiler.setup(BuildObserverController, "BuildObserverController");
        Profiler.setup(ObserverController, "ObserverController");

        Profiler.setup(RoleAttackCreep, "RoleAttackCreep");
        Profiler.setup(RoleClaimer, "RoleClaimer");
        Profiler.setup(RolePowerScavAttackCreep, "RolePowerScavAttackCreep");
        Profiler.setup(RolePowerScavHaulCreep, "RolePowerScavHaulCreep");
        Profiler.setup(RoleScavenger, "RoleScavenger");

        Profiler.setup(SignController, "SignController");

        Profiler.setup(EmpireController, "EmpireController");
        Profiler.setup(PowerScavController, "PowerScavController");
        Profiler.setup(ScavengeController, "ScavengeController");
        Profiler.setup(SpawnClaimerController, "SpawnClaimerController");

        Profiler.setup(CreepHelper, "CreepHelper");
        Profiler.setup(EmpireHelper, "EmpireHelper");
        Profiler.setup(FlagHelper, "FlagHelper");
        Profiler.setup(LogHelper, "LogHelper");
        Profiler.setup(MapHelper, "MapHelper");
        Profiler.setup(MovementHelper, "MovementHelper");
        Profiler.setup(RoomHelper, "RoomHelper");

        Profiler.setup(SpawnQueueController, "SpawnQueueController");

        Profiler.setup(MemoryController, "MemoryController");

        Profiler.setup(ReportController, "ReportController");

        Profiler.setup(RoleBankLinker, "RoleBankLinker");
        Profiler.setup(RoleHauler, "RoleHauler");
        Profiler.setup(RoleMiner, "RoleMiner");
        Profiler.setup(RoleLaborer, "RoleLaborer");
        Profiler.setup(RoleStocker, "RoleStocker");

        Profiler.setup(RoomSpawnController, "RoomSpawnController");
        Profiler.setup(SpawnBankLinker, "SpawnBankLinker");
        Profiler.setup(SpawnHauler, "SpawnHauler");
        Profiler.setup(SpawnLaborer, "SpawnLaborer");
        Profiler.setup(SpawnMiner, "SpawnMiner");
        Profiler.setup(SpawnStocker, "SpawnStocker");

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
        Profiler.setup(Stage6, "Stage6");
        Profiler.setup(Stage6_5, "Stage6_5");
        Profiler.setup(Stage6_25, "Stage6_25");
        Profiler.setup(Stage6_75, "Stage6_75");
        Profiler.setup(Stage7, "Stage7");
        Profiler.setup(Stage7_2, "Stage7_2");
        Profiler.setup(Stage7_4, "Stage7_4");
        Profiler.setup(Stage7_6, "Stage7_6");
        Profiler.setup(Stage7_8, "Stage7_8");
        Profiler.setup(StageDefault, "StageDefault");
        Profiler.setup(StageFunctions, "StageFunctions");

        Profiler.setup(RoomSourceLinkController, "RoomSourceLinkController");
        Profiler.setup(RoomTowerController, "RoomTowerController");

        Profiler.setup(RoomController, "RoomController");
        Profiler.setup(RoomDefenseController, "RoomDefenseController");
        Profiler.setup(RoomStageController, "RoomStageController");

        /**
         * Don't profile:
         *   ProfilerWrapper
         *   Profiler
         *   FunctionProfiler
         *   Constants
         *   ReportCooldownConstants
         *   SpawnConstants
         */
    }

    public static clearProfilingData(): void {
        //Clear all profiling on setup
        Memory.profiler = {
            startTick: Game.time
        } as ProfilerRawData;
    }

    public static detectProfileReport(): void {
        if (Game.flags["profile"] == null) {
            return;
        }

        const profile: ProfilerRawData = Memory.profiler;

        console.log("Profiling report:");

        const totalTicks: number = Game.time - profile.startTick + 1;

        console.log("TotalTicks: " + totalTicks);
        const table: string[][] = [];
        table[0] = ["Name", "AvgMsPerTick", "AvgCallsPerTick", "AvgMsPerCall", "Calls"];

        const classes: string[] = Object.keys(profile);
        classes.splice(classes.indexOf("startTick"), 1);

        const processedClasses: ProfilerProcessedDataClass[] = [];

        for (let i = 0; i < classes.length; i++) {
            const c: string = classes[i];
            const processedClass: ProfilerProcessedDataClass =
                this.getProcessedClassData(profile[c], c, totalTicks);
            processedClasses.push(processedClass);
        }

        processedClasses.sort((a, b) => {
            return b.avgMsUsagePerTick - a.avgMsUsagePerTick;
        });

        let index: number = 1;

        for (let i = 0; i < SHOW_TOP_X_CLASSES; i++) {
            const processedClass: ProfilerProcessedDataClass = processedClasses[i];

            table[index] = [processedClass.className,
                Number(processedClass.avgMsUsagePerTick.toFixed(FIXED_NUMBER)).toString()
                , "", "", ""];
            index++;

            for (let j = 0; j < processedClass.functions.length; j++) {
                const processedFunction: ProfilerProcessedDataFunction = processedClass.functions[j];


                table[index] = ["+ " + processedFunction.functionName,
                    Number(processedFunction.avgMsUsagePerTick.toFixed(FIXED_NUMBER)).toString(),
                    Number(processedFunction.callsPerTickAvg.toFixed(FIXED_NUMBER)).toString(),
                    Number(processedFunction.avgTime.toFixed(FIXED_NUMBER)).toString(),
                    processedFunction.callCount.toString()];

                index++;
            }
        }

        console.log("Top " + SHOW_TOP_X_CLASSES + " classes, based on AvgMsPerTick");

        LogHelper.logTable(table);

        Game.flags["profile"].remove();
    }

    private static getProcessedClassData(classData: ProfilerRawDataClass, className: string, totalTicks: number): ProfilerProcessedDataClass {
        const result: ProfilerProcessedDataClass = {
            className: className,
            avgMsUsagePerTick: 0,
            functions: []
        };
        const functions: string[] = Object.keys(classData);

        for (let i = 0; i < functions.length; i++) {
            const f: string = functions[i];
            const functionProcessed: ProfilerProcessedDataFunction = {
                functionName: f,
                avgMsUsagePerTick: 0,
                callsPerTickAvg: 0,
                avgTime: classData[f].average,
                callCount: classData[f].callCount
            };
            functionProcessed.callsPerTickAvg =
                classData[f].callCount / totalTicks;
            functionProcessed.avgMsUsagePerTick =
                functionProcessed.avgTime * functionProcessed.callsPerTickAvg;

            result.functions.push(functionProcessed);

            result.avgMsUsagePerTick += functionProcessed.avgMsUsagePerTick;
        }

        result.functions.sort((a, b) => {
            return b.avgMsUsagePerTick - a.avgMsUsagePerTick;
        });

        return result;
    }
}

interface ProfilerProcessedDataClass {
    className: string;
    avgMsUsagePerTick: number;
    functions: ProfilerProcessedDataFunction[];
}

interface ProfilerProcessedDataFunction {
    functionName: string;
    avgMsUsagePerTick: number;
    callsPerTickAvg: number;
    avgTime: number;
    callCount: number;
}

const SHOW_TOP_X_CLASSES: number = 5;
const FIXED_NUMBER: number = 5;