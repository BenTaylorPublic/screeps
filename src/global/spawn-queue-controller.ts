export class SpawnQueueController {
    public static queueCreepSpawn(body: BodyPartConstant[], myRoom: MyRoom, priority: number, name: string, role: CreepRoles): void {
        const newCreep: QueuedCreep = {
            body: body,
            energyCost: this.bodyCost(body),
            priority: priority,
            name: name,
            role: role
        };
        if (myRoom.spawnQueue.length === 0) {
            myRoom.spawnQueue.push(newCreep);
            return;
        }

        for (let i: number = 0; i < myRoom.spawnQueue.length; i++) {
            if (newCreep.priority > myRoom.spawnQueue[i].priority) {
                myRoom.spawnQueue.splice(i, 0, newCreep);
                return;
            }
        }
        //Still hasn't inserted yet
        myRoom.spawnQueue = myRoom.spawnQueue.concat(newCreep);
    }

    private static bodyCost(body: BodyPartConstant[]): number {
        return body.reduce(function (cost: number, part: BodyPartConstant): number {
            return cost + BODYPART_COST[part];
        }, 0);
    }
}