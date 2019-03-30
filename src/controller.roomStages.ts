export const controllerRoomStages: any = {
    run: function (myRoom: MyRoom) {
        const room: Room = Game.rooms[myRoom.name];

        /*
            Loosely based on RCL
            -1: No controller
            0: RCL 0
            1: RCL 1, fixed amount of MinerAndWorkers
            1.2: RCL 2, Using MinerAndWorker creeps to build source caches and bank
            1.4: Creating Miners and haulers
            1.6: Miners and haulers are fully assigned
            2: Start spawning builders when bank hits cap, only spawn MinerAndWorker on panic mode
            2.5: RCL 3, Start constructing tower
            3: Tower complete, Haulers place road when they walk
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
                myRoom.roomStage = 1.2;
                console.log("Room " + myRoom.name + " advanced to room stage 1.2");
            }
        }

        if (myRoom.roomStage === 1.2) {
            const containers: StructureContainer[] = room.find<StructureContainer>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER;
                }
            });

            if (containers.length === room.find(FIND_SOURCES_ACTIVE).length + 1) {
                //Caches and bank must be built
                myRoom.roomStage = 1.4;
                console.log("Room " + myRoom.name + " advanced to room stage 1.4");
            }
        }

        if (myRoom.roomStage === 1.4) {
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
                myRoom.roomStage = 1.6;
                console.log("Room " + myRoom.name + " advanced to room stage 1.6");
            }
        }

        if (myRoom.roomStage === 1.6) {
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
                        myRoom.roomStage = 2;
                        console.log("Room " + myRoom.name + " advanced to room stage 2");
                    }
                }
            }
        }

        if (myRoom.roomStage === 2) {
            if (room.controller.level === 3) {
                myRoom.roomStage = 2.5;
                console.log("Room " + myRoom.name + " advanced to room stage 2.5");
            }
        }

        if (myRoom.roomStage === 2.5) {

            const towers: StructureTower[] = room.find<StructureTower>(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return structure.structureType === STRUCTURE_TOWER;
                }
            });

            if (towers.length === 1) {
                //Tower has been built
                myRoom.roomStage = 3;
                console.log("Room " + myRoom.name + " advanced to room stage 3");
            }
        }
    }
};
