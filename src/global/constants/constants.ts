export class Constants {
    public static PERCENT_OF_CACHE_ENERGY_TO_SPAWN_HAULER: number = 0.5;
    public static AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER: number = 100_000;
    public static AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER_STAGE_8: number = 200_000;
    public static MAX_LABORERS: number = 3;
    public static MIN_LABORERS: number = 1;
    public static MAX_LABORERS_STAGE_8: number = 2;
    public static LABORERS_BEFORE_BANK: number = 3;
    public static LINK_TRANSFER_AT: number = 400;
    public static LINK_CONTROLLER_GOAL_ENERGY: number = 600;
    public static WALL_AND_RAMPART_GOAL_HEALTH: number = 500_000;
    public static CONSCRIPTION_RANGE: number = 3;
    public static CONSCRIPTION_QUICK_MINIMUM_STAGE: Stage = 1;
    public static CONSCRIPTION_PRESSURE_MINIMUM_STAGE: Stage = 6;
    public static RALLY_FLAG_RANGE: number = 3;
    public static POWER_SCAV_TTL_MIN: number = 4_500;
    public static POWER_SCAV_RANGE_MAX: number = 5;
    public static POWER_SCAV_ROOM_STAGE: Stage = 8;
    public static POWER_SCAV_MAX_BANKS_AT_ONE_TIME: number = 0;
    public static POWER_SCAV_MAX_DAMAGE_PER_TICK_PER_AREA: number = 240;
    public static POWER_SCAV_MAX_DAMAGE_TRAVEL_TICKS_PER_ROOM: number = 150;
    public static POWER_SCAV_MAX_HAUL_TRAVEL_TICKS_PER_ROOM: number = 50;
    public static POWER_SCAV_AREA_AROUND_BANK_MIN: number = 2;
    public static MAX_STOCKERS: number = 1;
    public static LABORERS_UPGRADE_WHEN_CONTROLLER_BENEATH: number = 5000;
    public static STAGE_8_SPAWN_LABORERS_WHEN_CONTROLLER_BENEATH: number = 100_000;
    public static STOCK_TOWER_TO: number = 900;
    public static REPAIR_ONLY_ON_ODD_THOUSAND: boolean = true;
    public static SCAVENGE_MIN_STAGE: Stage = 4;
    public static SCAVENGE_MAX_DISTANCE: number = 10;
    public static TERMINAL_GOAL_ENERGY: number = 20_000;
    public static MINERAL_START_STAGE: Stage = 6;
    public static BANK_LINKER_CAPACITY: number = 100;
    public static STAGE_8_DONATE_AT: number = 100_000;
    public static STAGE_8_DONATE_AMOUNT: number = 50_000;
    public static STAGE_8_ONE_SOURCE_ENERGY_DONATE_TARGET: number = 50_000;
    public static LAB_REACTION_AMOUNT_TO_CEIL_TO: number = 100;
    public static DONT_DONATE_TO_ROOMS_WITH_ABOVE_ENERGY: number = 250_000;
}
