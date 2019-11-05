export class Profiler {
    public static setup<T>(thing: T): void {
        console.log("Profiler-setup");

        if (Memory.profiler == null) {
            Memory.profiler = {};
        }

        const classString: string = (thing as any).name;
        console.log("Wrapping class: " + classString);

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) !== -1) {
                return; //This is a 'continue' in a forEach loop
            }
            console.log(classString + "." + functionName);
            // const originalFunction: Function = (thing as any)[functionName];
            // (thing as any)[functionName] = function (): any {
            //     //TODO: Timer start here
            //
            //     if (arguments.length === 2) {
            //         originalFunction.call(thing, arguments[0], arguments[1]);
            //     } else {
            //         console.log(arguments.length);
            //     }
            //
            //     //TODO: Timer end here
            // };
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