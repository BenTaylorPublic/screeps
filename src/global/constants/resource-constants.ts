export class ResourceConstants {
    public static getMineralLimits(): ResourceLimits {
        return {
            Z: {
                lower: 5_000,
                upper: 10_000
            },
            K: {
                lower: 5_000,
                upper: 10_000
            },
            U: {
                lower: 5_000,
                upper: 10_000
            },
            L: {
                lower: 5_000,
                upper: 10_000
            },
            H: {
                lower: 5_000,
                upper: 10_000
            },
            O: {
                lower: 5_000,
                upper: 10_000
            },
            X: {
                lower: 5_000,
                upper: 10_000
            }
        };
    }

    public static getBaseCompoundLimits(): ResourceLimitsWithReagents {
        return {
            ZK: {
                lower: 5_000,
                upper: 10_000,
                reagent1: "Z",
                reagent2: "K",
                cooldown: 5
            },
            UL: {
                lower: 5_000,
                upper: 10_000,
                reagent1: "U",
                reagent2: "L",
                cooldown: 5
            }
        };
    }

    public static getGCompoundLimits(): ResourceLimitsWithReagents {
        return {
            G: {
                lower: 5_000,
                upper: 10_000,
                reagent1: "ZK",
                reagent2: "UL",
                cooldown: 5
            }
        };
    }
}