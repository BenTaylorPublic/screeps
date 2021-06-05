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

    public static getTier1CompoundLimits(): ResourceLimitsWithReagents {
        return {
            UH: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "U",
                reagent2: "H",
                cooldown: 10
            },
            KO: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "K",
                reagent2: "O",
                cooldown: 10
            },
            GH: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "G",
                reagent2: "H",
                cooldown: 10
            },
            LO: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "L",
                reagent2: "O",
                cooldown: 10
            }
        };
    }

    public static getTier2CompoundLimits(): ResourceLimitsWithReagents {
        return {
            UH2O: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "UH",
                reagent2: "OH",
                cooldown: 5
            },
            KHO2: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "KO",
                reagent2: "OH",
                cooldown: 5
            },
            GH2O: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "GH",
                reagent2: "OH",
                cooldown: 15
            },
            LHO2: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "LO",
                reagent2: "OH",
                cooldown: 5
            }
        };
    }

    public static getTier3CompoundLimits(): ResourceLimitsWithReagents {
        return {
            XUH2O: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "X",
                reagent2: "UH2O",
                cooldown: 60
            },
            XKHO2: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "X",
                reagent2: "KHO2",
                cooldown: 60
            },
            XGH2O: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "X",
                reagent2: "GH2O",
                cooldown: 80
            },
            XLHO2: {
                lower: 3_000,
                upper: 4_000,
                reagent1: "X",
                reagent2: "LHO2",
                cooldown: 60
            }
        };
    }
}