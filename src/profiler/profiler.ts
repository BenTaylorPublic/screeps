export class Profiler {
    public static setup<T>(thing: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1
                && functionName === "run") {
                console.log("Wrapping " + functionName);
                (thing as any)[functionName] = function (derp: any): any {
                    console.log("B");
                    console.log(JSON.stringify(arguments));
                    // @ts-ignore
                    (thing as any)[functionName](arguments);
                    console.log("B");
                };
            }
        });

        console.log("Profiler-end setup");
    }


}

const excludeList: string[] = ["prototype", "length"];