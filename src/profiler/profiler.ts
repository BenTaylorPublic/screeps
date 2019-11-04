export class Profiler {
    public static setup<T>(classs: T): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(classs).forEach(functionName => {
            console.log(functionName);
        });

        console.log("Profiler-end setup");
    }
}