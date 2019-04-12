export const roomBuildingController: any = {
    run: function (myRoom: MyRoom) {
        ensureTheBuildingsAreSetup(myRoom);
    }
};

function ensureTheBuildingsAreSetup(myRoom: MyRoom): void {

}

function isConstructable(terrain: RoomTerrain, roomName: string, x: number, y: number): boolean {
    if (x < 0 || x > 49 || y < 0 || y > 49) {
        return false;
    }
    if (terrain.get(x, y) !== TERRAIN_MASK_WALL) {
        const roomPos: RoomPosition = new RoomPosition(x, y, roomName);
        const structures: Structure<StructureConstant>[] = roomPos.lookFor(LOOK_STRUCTURES);
        if (structures.length !== 0) {
            return false;
        } else {
            return true;
        }
    }

    return false;
}
