export class Profiler {
    public static setup<T>(thing: T, classString: string): void {
        console.log("Profiler-setup");

        if (Memory.profiler == null) {
            Memory.profiler = {};
        }

        console.log("Wrapping class: " + classString);

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) !== -1) {
                return; //This is a 'continue' in a forEach loop
            }
            console.log(classString + "." + functionName);
            const originalFunction: Function = (thing as any)[functionName];
            (thing as any)[functionName] = function (): any {
                //TODO: Timer start here
                if (arguments.length === 0) {
                    originalFunction.call(thing);
                } else if (arguments.length === 1) {
                    originalFunction.call(thing, arguments[0]);
                } else if (arguments.length === 2) {
                    originalFunction.call(thing, arguments[0], arguments[1]);
                } else if (arguments.length === 3) {
                    originalFunction.call(thing, arguments[0], arguments[1], arguments[2]);
                } else if (arguments.length === 4) {
                    originalFunction.call(thing, arguments[0], arguments[1], arguments[2], arguments[3]);
                } else if (arguments.length === 5) {
                    originalFunction.call(thing, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
                } else if (arguments.length === 6) {
                    originalFunction.call(thing, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                } else if (arguments.length === 7) {
                    originalFunction.call(thing, arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5], arguments[6]);
                } else {
                    console.log("ERROR: " + arguments.length);
                }

                //TODO: Timer end here
            };
        });

        console.log("Profiler-end setup");
    }


}

const excludeList: string[] = ["prototype", "length"];

// interface ProfilerData {
//     map: string[][];
// }
//
// interface ProfilerDataClass {
//
// }
//
// interface ProfilerDataFunction {
//
// }