import {Profiler, ProfilerRawData, ProfilerRawDataClass} from "./profiler";
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
        Profiler.setup(RoleAttackCreep, "RoleAttackCreep", ["attackLogic"]);
        Profiler.setup(RoleClaimer, "RoleClaimer", []);

        Profiler.setup(AttackController, "AttackController", []);
        Profiler.setup(AttackHelperFunctions, "AttackHelperFunctions", ["pathFindToRoomObject"]);
        Profiler.setup(AttackPressureController, "AttackPressureController", ["batchRunRally", "batchRunConscript", "spawnAttackPressureCreep", "startBatch", "endAttack"]);
        Profiler.setup(AttackQuickController, "AttackQuickController", ["spawnAttackQuickCreep", "endAttack"]);
        Profiler.setup(EmpireController, "EmpireController", []);
        Profiler.setup(SpawnClaimerController, "SpawnClaimerController", ["spawnClaimer"]);

        Profiler.setup(HelperFunctions, "HelperFunctions", ["calcBodyCost"]);

        Profiler.setup(ReportController, "ReportController", ["report", "niceDateFormat", "timeSince"]);

        Profiler.setup(RoleBankLinker, "RoleBankLinker", []);
        Profiler.setup(RoleHauler, "RoleHauler", []);
        Profiler.setup(RoleLaborer, "RoleLaborer", ["calculateCreepState", "pickupBank", "pickupCache", "pickupOutLink", "mining", "labor"]);
        Profiler.setup(RoleMiner, "RoleMiner", []);

        Profiler.setup(RoomSpawnController, "RoomSpawnController", []);
        Profiler.setup(SpawnBankLinker, "SpawnBankLinker", ["spawnBankLinker"]);
        Profiler.setup(SpawnHauler, "SpawnHauler", ["spawnHauler"]);
        Profiler.setup(SpawnLaborer, "SpawnLaborer", ["spawnLaborer"]);
        Profiler.setup(SpawnMiner, "SpawnMiner", ["spawnMiner"]);

        Profiler.setup(Stage0, "Stage0", []);
        Profiler.setup(Stage0_5, "Stage0_5", ["step"]);
        Profiler.setup(Stage1, "Stage1", []);
        Profiler.setup(Stage1_3, "Stage1_3", ["step"]);
        Profiler.setup(Stage1_6, "Stage1_6", ["step", "containerInPos"]);
        Profiler.setup(Stage2, "Stage2", []);
        Profiler.setup(Stage2_3, "Stage2_3", ["step"]);
        Profiler.setup(Stage2_6, "Stage2_6", ["step"]);
        Profiler.setup(Stage3, "Stage3", []);
        Profiler.setup(Stage3_3, "Stage3_3", ["step"]);
        Profiler.setup(Stage3_6, "Stage3_6", ["step"]);
        Profiler.setup(Stage4, "Stage4", []);
        Profiler.setup(Stage4_2, "Stage4_2", ["step"]);
        Profiler.setup(Stage4_4, "Stage4_4", ["step"]);
        Profiler.setup(Stage4_6, "Stage4_6", ["step"]);
        Profiler.setup(Stage4_8, "Stage4_8", ["step"]);
        Profiler.setup(Stage5, "Stage5", []);
        Profiler.setup(Stage5_2, "Stage5_2", ["step"]);
        Profiler.setup(Stage5_4, "Stage5_4", ["step"]);
        Profiler.setup(Stage5_6, "Stage5_6", ["step"]);
        Profiler.setup(Stage5_8, "Stage5_8", ["step"]);
        Profiler.setup(StageDefault, "StageDefault", []);
        Profiler.setup(StageFunctions, "StageFunctions", []);

        Profiler.setup(RoomSourceLinkController, "RoomSourceLinkController", []);
        Profiler.setup(RoomTowerController, "RoomTowerController", []);

        Profiler.setup(RoomController, "RoomController", []);
        Profiler.setup(RoomStageController, "RoomStageController", []);

        Profiler.setup(ScheduleController, "ScheduleController", ["setFalseOnPendingConscriptedCreep"]);
    }

    public static clearProfilingData(): void {
        //Clear all profiling on setup
        Memory.profiler = {
            startTick: Game.time
        } as ProfilerRawData;
    }

    public static detectProfileReport(): void {
        if (Game.time % 10 !== 0 ||
            Game.flags["profile"] == null) {
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
                Number(processedClass.avgMsUsagePerTick.toFixed(FIXED_NUMBER)).toString() + "ms"
                , "", "", ""];
            index++;

            for (let j = 0; j < processedClass.functions.length; j++) {
                const processedFunction: ProfilerProcessedDataFunction = processedClass.functions[j];

                table[index] = [processedFunction.functionName,
                    Number(processedFunction.avgMsUsagePerTick.toFixed(FIXED_NUMBER)).toString() + "ms",
                    Number(processedFunction.callsPerTickAvg.toFixed(FIXED_NUMBER)).toString(),
                    Number(processedFunction.avgTime.toFixed(FIXED_NUMBER)).toString() + "ms",
                    processedFunction.callCount.toString()];

                index++;
            }
        }

        this.logTable(table);

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
                callCount: classData[f].callCount,
                privateFunction: classData[f].privateFunction
            };
            functionProcessed.callsPerTickAvg =
                classData[f].callCount / totalTicks;
            functionProcessed.avgMsUsagePerTick =
                functionProcessed.avgTime * functionProcessed.callsPerTickAvg;

            result.functions.push(functionProcessed);

            if (!functionProcessed.privateFunction) {
                result.avgMsUsagePerTick += functionProcessed.avgMsUsagePerTick;
            }
        }

        result.functions.sort((a, b) => {
            return b.avgMsUsagePerTick - a.avgMsUsagePerTick;
        });

        return result;
    }

    private static logTable(table: string[][]): void {
        //If the table is missing things then it'll just break
        const maxColumnWidth: number[] = [];
        for (let columnIndex: number = 0; columnIndex < table[0].length; columnIndex++) {
            maxColumnWidth[columnIndex] = 0;
            for (let rowIndex: number = 0; rowIndex < table.length; rowIndex++) {
                const length: number = table[rowIndex][columnIndex].length;
                if (length > maxColumnWidth[columnIndex]) {
                    maxColumnWidth[columnIndex] = length + 1;
                }
            }
        }

        for (let rowIndex: number = 0; rowIndex < table.length; rowIndex++) {
            let rowAsString: string = "";
            for (let columnIndex: number = 0; columnIndex < table[rowIndex].length; columnIndex++) {
                const dataInCell: string = table[rowIndex][columnIndex];
                rowAsString += dataInCell;
                const spacesToAdd: number = maxColumnWidth[columnIndex] - dataInCell.length;
                for (let spacesToFill = 0; spacesToFill < spacesToAdd; spacesToFill++) {
                    rowAsString += " ";
                }
            }
            console.log(rowAsString);
        }
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
    privateFunction: boolean;
}

const SHOW_TOP_X_CLASSES: number = 5;
const FIXED_NUMBER: number = 5;