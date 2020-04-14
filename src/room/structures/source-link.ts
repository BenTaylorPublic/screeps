import {LogHelper} from "../../global/helpers/log-helper";
import {Constants} from "../../global/constants/constants";
import {ReportController} from "../../reporting/report-controller";


export class RoomSourceLinkController {
    public static run(myRoom: MyRoom, myLink: MyLink): void {
        if (myLink.id === null) {
            return;
        }
        if (myRoom.bankLink == null || myRoom.bankLink.id == null) {
            return;
        }

        const link: StructureLink | null = Game.getObjectById<StructureLink>(myLink.id);
        if (link === null) {
            ReportController.email("ERROR: Link was null when accessed by ID. Setting it to null in " + LogHelper.roomNameAsLink(myRoom.name));
            myLink.id = null;
            return;
        }

        if (link.store.energy >= Constants.SOURCE_LINK_TRANSFER_AT) {
            //Need to transfer energy
            const bankLink: StructureLink | null = Game.getObjectById<StructureLink>(myRoom.bankLink.id);
            if (bankLink === null) {
                ReportController.email("ERROR: Bank link was null when accessed by ID. Setting it to null in " + LogHelper.roomNameAsLink(myRoom.name));
                myRoom.bankLink.id = null;
                return;
            }

            //Just try it. Might error, but oh well
            link.transferEnergy(bankLink);
        }

    }
}
