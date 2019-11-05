import {RoleLaborer} from "../room/roles/laborer";
import {Profiler} from "./profiler";

export class ProfilerWrapper {
    public static setup(): void {
        Profiler.setup(RoleLaborer);
    }
}