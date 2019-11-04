export class Profiler {
    public static setup<T>(thing: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1) {
                console.log("Wrapping " + functionName);
                const wrappedResult: Function = this.wrap((thing as any)[functionName]);
                console.log(wrappedResult);
                // (thing as any)[functionName] =
            }
        });

        console.log("Profiler-end setup");
    }

    private static wrap(originalFunction: Function): Function {
        return () => {
            originalFunction.apply(this, arguments);
        };
    }
}

const excludeList: string[] = ["prototype", "length"];
