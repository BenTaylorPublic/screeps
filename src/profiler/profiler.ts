export class Profiler {
    public static setup<T>(thing: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1
                && functionName === "run") {
                console.log("Wrapping " + functionName);
                (thing as any)[functionName] = function (): any {
                    console.log("B");
                    console.log(JSON.stringify(arguments));
                    // @ts-ignore
                    thing[functionName](thing, Array.prototype.slice.call(arguments, 1));
                    console.log("B");
                };
            }
        });

        console.log("Profiler-end setup");
    }


}

const excludeList: string[] = ["prototype", "length"];