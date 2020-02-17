import {HelperFunctions} from "../../global/helper-functions";

export class ObserverController {
    public static run(myMemory: MyMemory): void {
        const observerMemory: ObserverMemory = myMemory.empire.observer;

        this.generateTargetsIfNeeded(observerMemory);

        if (observerMemory.observerIds.length === 0) {
            return;
        }

        //TODO: Observe logic

    }

    private static generateTargetsIfNeeded(observerMemory: ObserverMemory): void {
        if (Game.time % 10 !== 0) {
            return;
        }

        const flagNames: string[] = Object.keys(Game.flags);
        for (let i = flagNames.length - 1; i >= 0; i--) {
            const flagName: string = flagNames[i];
            const flagNameSplit: string[] = flagName.split("-");
            if (flagNameSplit[0] !== "observer" ||
                flagNameSplit[1] !== "set") {
                flagNames.splice(i, 1);
            }
        }

        if (flagNames.length !== 1) {
            return;
        }
        const flag: Flag = Game.flags[flagNames[0]];
        const size: number = Number(flag.name.split("-")[2]);

        const topLeftRoomName: MyRoomName = HelperFunctions.getRoomNameAsInterface(flag.pos.roomName);
        observerMemory.targetList = [];
        for (let x: number = topLeftRoomName.xNum; x < topLeftRoomName.xNum + size; x++) {
            for (let y: number = topLeftRoomName.yNum; y < topLeftRoomName.yNum + size; y++) {
                observerMemory.targetList.push(topLeftRoomName.xChar + x + topLeftRoomName.yChar + y);
            }
        }

        //TODO: REMOVE IF WORKS
        if (observerMemory.targetList.length !== size * size) {
            console.log("ERROR: Should be size*size " + (size * size));
            console.log(JSON.stringify(observerMemory.targetList));
        }
    }
}