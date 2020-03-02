export class SpawnQueueController {
    public static queueCreepSpawn(body: BodyPartConstant[], myRoom: MyRoom, priority: number, name: string): void {
        const newCreep: QueuedCreep = {
            body: body,
            energyCost: this.bodyCost(body),
            priority: priority,
            name: name
        };
        if (myRoom.spawnQueue.length === 0) {
            myRoom.spawnQueue.push(newCreep);
            return;
        }

        for (let i: number = 0; i < myRoom.spawnQueue.length; i++) {
            if (newCreep.priority > myRoom.spawnQueue[i].priority) {
                myRoom.spawnQueue.splice(i, 0, newCreep);
                this.tempLog(myRoom.spawnQueue);
                return;
            }
        }
        //Still hasn't inserted yet
        this.tempLog(myRoom.spawnQueue);
        myRoom.spawnQueue = myRoom.spawnQueue.concat(newCreep);
    }

    private static tempLog(spawnQueue: QueuedCreep[]): void {
        if (spawnQueue.length <= 1) {
            return;
        }
        let result: string = "[";
        for (let i: number = 0; i < spawnQueue.length; i++) {
            result += spawnQueue[i].priority + ", ";
        }
        result += "END]";
        Game.notify(result);
    }

    private static bodyCost(body: BodyPartConstant[]): number {
        return body.reduce(function (cost: number, part: BodyPartConstant): number {
            return cost + BODYPART_COST[part];
        }, 0);
    }
}