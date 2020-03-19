export class Constants {
    public static MAX_HAULERS_PER_SOURCE: number = 1;
    public static PERCENT_OF_CACHE_ENERGY_TO_SPAWN_HAULER: number = 0.5;
    public static HAULER_COOLDOWN_DISTANCE_FACTOR: number = 1.2;
    public static AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER: number = 100_000;
    public static MAX_LABORERS: number = 6;
    public static MIN_LABORERS: number = 1;
    public static MAX_LABORERS_STAGE_8: number = 2;
    public static LABORERS_BEFORE_BANK: number = 6;
    public static SOURCE_LINK_TRANSFER_AT: number = 0.5;
    public static WALL_AND_RAMPART_GOAL_HEALTH: number = 500_000;
    public static CONSCRIPTION_RANGE: number = 15;
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
    public static SCAVENGE_MAX_DISTANCE: Stage = 10;
}
