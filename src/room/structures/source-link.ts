import {LogHelper} from "../../global/helpers/log-helper";
import {Constants} from "../../global/constants/constants";
import {ReportController} from "../../reporting/report-controller";


export class RoomSourceLinkController {
    public static run(myRoom: MyRoom, myLink: MyLink): void {
        if (myLink.id === null) {
            return;
        }
        if (myRoom.bank == null ||
            myRoom.bank.bankLink == null ||
            myRoom.bank.bankLink.id == null) {
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

            if (myRoom.controllerLink != null &&
                myRoom.controllerLink.id != null) {
                const controllerLink: StructureLink | null = Game.getObjectById<StructureLink>(myRoom.controllerLink.id);
                if (controllerLink == null) {
                    ReportController.email("ERROR: Controller link was null when accessed by ID. Setting it to null in " + LogHelper.roomNameAsLink(myRoom.name));
                    myRoom.controllerLink.id = null;
                } else {
                    if (controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) >= link.store.energy) {
                        if (link.transferEnergy(controllerLink) === OK) {
                            return;
                        }
                    }
                }

            }

            const bankLink: StructureLink | null = Game.getObjectById<StructureLink>(myRoom.bank.bankLink.id);
            if (bankLink === null) {
                ReportController.email("ERROR: Bank link was null when accessed by ID. Setting it to null in " + LogHelper.roomNameAsLink(myRoom.name));
                myRoom.bank.bankLink.id = null;
                return;
            }

            //Just try it. Might error, but oh well
            link.transferEnergy(bankLink);
        }

    }
}
