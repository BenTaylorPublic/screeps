// tslint:disable-next-line: class-name
export class Stage4_8 {
    /*
    4.8 ->  5   : Room has 1 sources using links, no cache or hauler
    4.8 <-  5   : Room has 0 sources using links, no cache or hauler
    */
    public static up(myRoom: MyRoom, room: Room): boolean {
        this.step(myRoom, room);

        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null &&
                mySource.cache != null &&
                mySource.cache.id == null &&
                mySource.haulerNames.length === 0) {
                myRoom.roomStage = 5;
                console.log("LOG: Room " + myRoom.name + " increased to room stage 5");
                return true;
            }
        }
        return false;
    }

    public static down(myRoom: MyRoom, room: Room): boolean {
        let foundLinkedSource: boolean = false;
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null &&
                mySource.cache != null &&
                mySource.cache.id == null &&
                mySource.haulerNames.length === 0) {
                foundLinkedSource = true;
                break;
            }
        }
        if (!foundLinkedSource) {
            myRoom.roomStage = 4.8;
            console.log("LOG: Room " + myRoom.name + " decreased to room stage 4.8");
            return true;
        }
        return false;

    }

    private static step(myRoom: MyRoom, room: Room): void {
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.state === "Link" &&
                mySource.link != null &&
                mySource.link.id != null) {
                // Source has a link that's setup
                // Kill all the haulers
                for (let j = 0; j < mySource.haulerNames.length; j++) {
                    const haulerName: string = mySource.haulerNames[j];
                    const creep: Creep | null = Game.creeps[haulerName];
                    if (creep != null) {
                        creep.say("dthb4dshnr");
                        creep.suicide();
                    }
                }
                mySource.haulerNames = [];

                // Kill the miner if he doesn't have 1 Carry part
                if (mySource.minerName != null) {
                    const creep: Creep | null = Game.creeps[mySource.minerName];
                    if (creep != null &&
                        creep.getActiveBodyparts(CARRY) === 0) {
                        creep.say("dthb4dshnr");
                        creep.suicide();
                        mySource.minerName = null;
                    }
                }

                // Destroy the caches
                if (mySource.cache != null &&
                    mySource.cache.id != null) {
                    const cache: StructureContainer | null = Game.getObjectById<StructureContainer>(mySource.cache.id);
                    if (cache == null) {
                        mySource.cache.id = null;
                    } else {
                        cache.destroy();
                        mySource.cache.id = null;
                    }
                }
            }
        }
    }
}
