export class ResourceConstants {
    public static getMineralLimits(): ResourceLimits {
        return {
            Z: {
                lower: 1_000,
                upper: 3_000
            },
            K: {
                lower: 1_000,
                upper: 3_000
            },
            U: {
                lower: 1_000,
                upper: 3_000
            },
            L: {
                lower: 1_000,
                upper: 3_000
            },
            H: {
                lower: 1_000,
                upper: 3_000
            },
            O: {
                lower: 1_000,
                upper: 3_000
            },
            X: {
                lower: 1_000,
                upper: 3_000
            }
        };
    }

    public static getBaseCompoundLimits(): ResourceLimitsWithReagents {
        return {
            ZK: {
                lower: 1_000,
                upper: 3_000,
                reagent1: "Z",
                reagent2: "K"
            }
        };
    }
}