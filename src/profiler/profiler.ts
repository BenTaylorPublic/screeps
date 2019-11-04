export class Profiler {
    public static setup<T>(thing: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1) {
                console.log("Wrapping " + functionName);
                const wrappedResult: Function = wrap(thing, (thing as any)[functionName]);
                console.log(wrappedResult);
                (thing as any)[functionName] = wrappedResult;
                console.log((thing as any)[functionName]);
            }
        });

        console.log("Profiler-end setup");
    }


}

const excludeList: string[] = ["prototype", "length"];

function wrap(obj: any, originalFunction: Function): Function {
    return (a: any) => {
        originalFunction.apply(obj, a);
    };
}