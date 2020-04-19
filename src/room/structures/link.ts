import {LogHelper} from "../../global/helpers/log-helper";
import {Constants} from "../../global/constants/constants";
import {ReportController} from "../../reporting/report-controller";


export class RoomLinkController {
    public static run(myRoom: MyRoom): boolean {
        if (myRoom.roomStage < 4 ||
            myRoom.bank == null ||
            myRoom.bank.bankLink == null ||
            myRoom.bank.bankLink.id == null) {
            return false;
        }

        let linkControllerNeedsEnergy: boolean = false;
        let controllerLink: StructureLink | null = null;
        if (myRoom.controllerLink != null &&
            myRoom.controllerLink.id != null) {
            controllerLink = Game.getObjectById<StructureLink>(myRoom.controllerLink.id);
            if (controllerLink == null) {
                ReportController.email("ERROR: Controller link was null when accessed by ID. Setting it to null in " + LogHelper.roomNameAsLink(myRoom.name));
                myRoom.controllerLink.id = null;
            } else if (controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) >= Constants.LINK_TRANSFER_AT) {
                linkControllerNeedsEnergy = true;
            } else {
                controllerLink = null;
            }
        }
        for (let i = 0; i < myRoom.mySources.length; i++) {
            const mySource: MySource = myRoom.mySources[i];
            if (mySource.link != null) {
                if (this.runSourceLink(myRoom, mySource.link, controllerLink)) {
                    controllerLink = null;
                    linkControllerNeedsEnergy = false;
                }
            }
        }

        if (linkControllerNeedsEnergy) {
            const bankLink: StructureLink | null = Game.getObjectById<StructureLink>(myRoom.bank.bankLink.id);
            if (bankLink == null) {
                ReportController.email("ERROR: Bank link was null when accessed by ID. Setting it to null in " + LogHelper.roomNameAsLink(myRoom.name));
                myRoom.bank.bankLink.id = null;
            } else if (bankLink.store.energy >= Constants.LINK_TRANSFER_AT &&
                (controllerLink as StructureLink).store.getFreeCapacity(RESOURCE_ENERGY) >= bankLink.store.energy) {
                if (bankLink.transferEnergy(controllerLink as StructureLink) === OK) {
                    linkControllerNeedsEnergy = false;
                }

            }


        }
        return linkControllerNeedsEnergy;
    }

    public static runSourceLink(myRoom: MyRoom, myLink: MyLink, controllerLink: StructureLink | null): boolean {
        if (myLink.id === null) {
            return false;
        }
        if (myRoom.bank == null ||
            myRoom.bank.bankLink == null ||
            myRoom.bank.bankLink.id == null) {
            return false;
        }

        const link: StructureLink | null = Game.getObjectById<StructureLink>(myLink.id);
        if (link === null) {
            ReportController.email("ERROR: Link was null when accessed by ID. Setting it to null in " + LogHelper.roomNameAsLink(myRoom.name));
            myLink.id = null;
            return false;
        }

        if (link.store.energy >= Constants.LINK_TRANSFER_AT) {
            //Need to transfer energy
            if (controllerLink != null &&
                controllerLink.store.getFreeCapacity(RESOURCE_ENERGY) >= link.store.energy) {
                if (link.transferEnergy(controllerLink) === OK) {
                    return true;
                }
            }

            const bankLink: StructureLink | null = Game.getObjectById<StructureLink>(myRoom.bank.bankLink.id);
            if (bankLink === null) {
                ReportController.email("ERROR: Bank link was null when accessed by ID. Setting it to null in " + LogHelper.roomNameAsLink(myRoom.name));
                myRoom.bank.bankLink.id = null;
                return false;
            }

            //Just try it. Might error, but oh well
            link.transferEnergy(bankLink);
        }
        return false;
    }
}
