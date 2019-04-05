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
    }
};
