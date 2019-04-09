export const global: any = {
    getId: function (): number {
        const toReturn: number = Memory.myMemory.globalId;
        Memory.myMemory.globalId++;
        return toReturn;
    },
    calcBodyCost: function (body: BodyPartConstant[]): number {
        return body.reduce(function (cost: number, part: BodyPartConstant) {
            return cost + BODYPART_COST[part];
        }, 0);
    },
    generateBody: function (
        baseBody: BodyPartConstant[],
        bodyPartsToAdd: BodyPartConstant[],
        room: Room,
        useBest: boolean
    ): BodyPartConstant[] {

        const maxEnergyToUse: number =
            (useBest) ?
                room.energyCapacityAvailable :
                room.energyAvailable;

        let body: BodyPartConstant[] = baseBody;
        while (true) {
            if (global.calcBodyCost(body) + global.calcBodyCost(bodyPartsToAdd) <= maxEnergyToUse &&
                body.length + bodyPartsToAdd.length <= 50) {
                body = body.concat(bodyPartsToAdd);
            } else {
                break;
            }
        }
        return body;
    }
};
