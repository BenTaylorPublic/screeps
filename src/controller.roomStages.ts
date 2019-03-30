export const controllerRoomStages: any = {
    run: function (myRoom: MyRoom) {
        const room: Room = Game.rooms[myRoom.name];

        /*
            Loosely based on RCL
            -1  = no controller
            0   = rcl 0
            1   = rcl 1
            2   = rcl 2
            2.2 = rcl 3, start building tower
            2.4 = tower built, start building containers
            2.6 = caches and bank built, start creating miners and haulers
            2.8 = miners and haulers all assigned
            3   = bank hit cap, spawn builders
            TODO: Define more stages
         */

        if (room.controller == null ||
            room.controller.my === false) {
            //Room has no controller, or is not my room
            myRoom.roomStage = -1;
            return; //Do not continue
        }

        if (myRoom.roomStage === 0) {
            //From 0 -> 1, the room must have a RCL 1
            if (room.controller.level === 1) {
                myRoom.roomStage = 1;
                console.log("Room " + myRoom.name + " advanced to room stage 1");
            }
        }

        if (myRoom.roomStage === 1) {
            if (room.controller.level === 2) {
                myRoom.roomStage = 2;
                console.log("Room " + myRoom.name + " advanced to room stage 2");
            }
        }

        if (myRoom.roomStage === 2) {
            if (room.controller.level === 3) {
                myRoom.roomStage = 2.2;
                console.log("Room " + myRoom.name + " advanced to room stage 2.2");
            }
        }

        if (myRoom.roomStage === 2.2) {
            const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_TOWER;
                }
            });

            if (towers.length === 1) {
                //Tower has been built
                myRoom.roomStage = 2.4;
                console.log("Room " + myRoom.name + " advanced to room stage 2.4");
            }
        }

        if (myRoom.roomStage === 2.4) {

            const containers: StructureContainer[] = room.find<StructureContainer>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER;
                }
            });

            if (containers.length === room.find(FIND_SOURCES_ACTIVE).length + 1) {
                //Caches and bank must be built
                myRoom.roomStage = 2.6;
                console.log("Room " + myRoom.name + " advanced to room stage 2.6");
            }

        }

        if (myRoom.roomStage === 2.6) {
            let haulerAmount: number = 0;
            let minerAmount: number = 0;
            for (let i = 0; i < myRoom.myCreeps.length; i++) {
                const myCreep: MyCreep = myRoom.myCreeps[i];
                if (myCreep.role === "Hauler") {
                    haulerAmount++;
                } else if (myCreep.role === "Miner") {
                    minerAmount++;
                }
            }
            const amountOfSources: number = room.find(FIND_SOURCES_ACTIVE).length;
            if (haulerAmount === amountOfSources &&
                minerAmount === amountOfSources) {
                myRoom.roomStage = 2.8;
                console.log("Room " + myRoom.name + " advanced to room stage 2.8");
            }

        }

        if (myRoom.roomStage === 2.8) {

            let myBankContainer: MyContainer | null = null;

            for (let i = 0; i < myRoom.myContainers.length; i++) {
                const myContainer = myRoom.myContainers[i];
                if (myContainer.role === "Bank") {
                    myBankContainer = myContainer;
                }
            }

            if (myBankContainer != null) {
                const bankContainer: StructureContainer | null =
                    Game.getObjectById<StructureContainer>(myBankContainer.id);
                if (bankContainer != null) {
                    if (bankContainer.store[RESOURCE_ENERGY] === bankContainer.storeCapacity) {
                        //Bank is full
                        myRoom.roomStage = 3;
                        console.log("Room " + myRoom.name + " advanced to room stage 3");
                    }
                }
            }

        }


        if (myRoom.roomStage === 3) {
            //TODO:
        }
    }
};









