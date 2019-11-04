export class Profiler {
    public static setup<T>(classs: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(classs).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1) {
                console.log(functionName);
            }
        });

        console.log("Profiler-end setup");
    }
}

const excludeList: string[] =  ["prototype", "length"];