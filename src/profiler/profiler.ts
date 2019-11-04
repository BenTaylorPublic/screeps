export class Profiler {
    public static setup<T>(thing: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1) {
                console.log(functionName);
                (thing as any)[functionName] = this.wrap((thing as any)[functionName]);
            }
        });

        console.log("Profiler-end setup");
    }

    private static wrap(originalFunction: Function): Function {
        console.log(originalFunction);
        console.log(typeof originalFunction);
        return originalFunction.call(() => {
            console.log("ayy");
            originalFunction.apply(this, arguments);
            console.log("yo");
        });
    }
}

const excludeList: string[] = ["prototype", "length"];
