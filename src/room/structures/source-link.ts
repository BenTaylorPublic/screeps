import { Constants } from "../../global/constants";

export class RoomSourceLinkController {
    public static run(myRoom: MyRoom, myLink: MyLink): void {
        if (myLink.id === null) { return; }
        if (myRoom.bankLink == null ||
            myRoom.bankLink.id == null) { return; }

        const link: StructureLink | null = Game.getObjectById<StructureLink>(myLink.id);
        if (link === null) {
            console.log("ERR: Link was null when accessed by ID. Setting it to null");
            myLink.id = null;
            return;
        }

        if (link.energy >= Constants.SOURCE_LINK_TRANSFER_AT) {

            //Need to transfer energy

            let transferredToOutLink: boolean = false;
            for (let i = 0; i < myRoom.outLinks.length; i++) {
                const myOutLink: MyLink = myRoom.outLinks[i];

                if (myOutLink.id != null) {
                    const outLink: StructureLink | null = Game.getObjectById<StructureLink>(myOutLink.id);
                    if (outLink != null) {
                        if (outLink.energyCapacity - outLink.energy > link.energy) {
                            link.transferEnergy(outLink);
                            transferredToOutLink = true;
                        }
                    }
                }
            }

            if (!transferredToOutLink) {
                const bankLink: StructureLink | null = Game.getObjectById<StructureLink>(myRoom.bankLink.id);
                if (bankLink === null) {
                    console.log("ERR: Bank link was null when accessed by ID. Setting it to null");
                    myRoom.bankLink.id = null;
                    return;
                }

                //Just try it. Might error, but oh well
                link.transferEnergy(bankLink);
            }
        }

    }
}
