export class Profiler {
    public static setup<T>(thing: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1) {
                console.log(functionName);


                Object.defineProperty(thing, functionName, derp);
            }
        });

        console.log("Profiler-end setup");
    }
}

const excludeList: string[] = ["prototype", "length"];

function derp(): void {
    console.log("Fs in chat bois");
}