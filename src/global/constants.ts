export class Constants {
    public static MAX_HAULERS_PER_SOURCE: number = 2;
    public static PERCENT_OF_CACHE_ENERGY_TO_SPAWN_HAULER: number = 0.5;
    public static HAULER_COOLDOWN_DISTANCE_FACTOR: number = 1.2;
    public static AMOUNT_OF_BANK_ENERGY_TO_SPAWN_LABORER: number = 100000;
    public static MAX_LABORERS: number = 10;
    public static MIN_LABORERS: number = 1;
    public static LABORERS_BEFORE_BANK: number = 6;
    public static SOURCE_LINK_TRANSFER_AT: number = 0.5;
    public static WALL_AND_RAMPART_GOAL_HEALTH: number = 10000;
    public static TOWER_REPAIR_ABOVE_PERCENT: number = 0.5;
    public static CONSCRIPTION_RANGE: number = 3;
    public static CONSCRIPTION_QUICK_MINIMUM_STAGE: Stage = 4;
    public static CONSCRIPTION_PRESSURE_MINIMUM_STAGE: Stage = 6;
    public static RALLY_FLAG_RANGE: number = 3;
    public static POWER_SCAVENGE_TTL_MIN: number = 4500;
    public static POWER_SCAVENGE_RANGE_MAX: number = 5;
    public static POWER_SCAVENGE_ROOM_STAGE: Stage = 8;
    public static POWER_SCAVENGE_MAX_BANKS_AT_ONE_TIME: number = 1;
    public static POWER_SCAVENGE_MAX_DAMAGE_PER_TICK_PER_AREA: number = 240;
    public static POWER_SCAVENGE_MAX_DAMAGE_TRAVEL_TICKS_PER_ROOM: number = 150;
    public static POWER_SCAVENGE_MAX_HAUL_TRAVEL_TICKS_PER_ROOM: number = 50;
}
