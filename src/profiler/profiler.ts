export class Profiler {
    public static setup<T>(thing: T, classString: string): void {
        const profiler: ProfilerRawData = Memory.profiler as ProfilerRawData;
        profiler[classString] = {} as ProfilerRawDataClass;

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) !== -1) {
                return; //This is a 'continue' in a forEach loop
            }

            profiler[classString][functionName] = {
                callCount: 0,
                average: 0
            } as ProfilerRawDataFunction;

            const originalFunction: Function = (thing as any)[functionName];
            (thing as any)[functionName] = function (): any {
                const before: number = Game.cpu.getUsed();
                let result: any;

                if (arguments.length === 0) {
                    result = originalFunction.call(thing);
                } else if (arguments.length === 1) {
                    result = originalFunction.call(thing, arguments[0]);
                } else if (arguments.length === 2) {
                    result = originalFunction.call(thing, arguments[0], arguments[1]);
                } else if (arguments.length === 3) {
                    result = originalFunction.call(thing, arguments[0], arguments[1], arguments[2]);
                } else if (arguments.length === 4) {
                    result = originalFunction.call(thing, arguments[0], arguments[1], arguments[2], arguments[3]);
                } else if (arguments.length === 5) {
                    result = originalFunction.call(thing, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                } else if (arguments.length === 6) {
                    result = originalFunction.call(thing, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                } else if (arguments.length === 7) {
                    result = originalFunction.call(thing, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                } else {
                    //Don't use report controller (infiniteloop?)
                    console.log("ERROR87: " + arguments.length);
                }

                const after: number = Game.cpu.getUsed();

                Memory.profiler[classString][functionName].average =
                    ((Memory.profiler[classString][functionName].average * Memory.profiler[classString][functionName].callCount) + (after - before))
                    / (Memory.profiler[classString][functionName].callCount + 1);

                Memory.profiler[classString][functionName].callCount += 1;

                return result;
            };
        });
    }


}

const excludeList: string[] = ["prototype", "length", "name"];

export interface ProfilerRawDataClass {
    [key: string]: ProfilerRawDataFunction;
}

export interface ProfilerRawDataFunction {
    callCount: number;
    average: number;
}