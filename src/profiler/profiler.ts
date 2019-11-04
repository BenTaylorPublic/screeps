export class Profiler {
    public static setup<T>(thing: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1
                && functionName === "run") {
                console.log("Wrapping " + functionName);
                (thing as any)[functionName] = wrap((thing as any)[functionName]);
            }
        });

        console.log("Profiler-end setup");
    }


}

const excludeList: string[] = ["prototype", "length"];

function wrap(originalFunction: Function): Function {
    return (derp: any) => {
        console.log("B");
        console.log(JSON.stringify(arguments));
        // @ts-ignore
        originalFunction.apply(this, arguments);
        console.log("B");
    };
}