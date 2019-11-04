export class Profiler {
    public static setup<T>(thing: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1
                && functionName === "run") {
                console.log("Wrapping " + functionName);
                const originalFunction: Function = (thing as any)[functionName];
                (thing as any)[functionName] = function (): any {
                    console.log("Begin");

                    if (arguments.length === 2) {
                        console.log("2!");
                        originalFunction.call(thing, arguments);
                    } else {
                        console.log(arguments.length);
                    }

                    console.log("End");
                };
            }
        });

        console.log("Profiler-end setup");
    }


}

const excludeList: string[] = ["prototype", "length"];