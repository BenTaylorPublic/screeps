export class PowerScavengeController {
    public static observedPowerBank(powerBank: StructurePowerBank): void {
        //Test if it's valid
        //  >~4800 TTL
        //  Get nearest 3, stage 8 spawns
        //  < ~10 rooms away
        //  return if not valid
        //If valid
        //  Check if its already in Memory.myMemory.empire.powerScavenge.banksScavengingFrom (by id)
        //  return if not valid
        //Conscript a creep from all 3 spawns
    }
}