import {RoleClaimer} from "./role/claimer";

export class EmpireController {
    public static run(myMemory: MyMemory): void {

        //Controlling claimers
        for (let i = 0; i < myMemory.myTravelingCreeps.length; i++) {
            const travelingCreep: MyCreep = myMemory.myTravelingCreeps[i];
            if (travelingCreep.role === "Claimer") {
                RoleClaimer.run(travelingCreep as Claimer);
            }
        }
    }
}
