export class Profiler {
    public static setup(classs: DERP): void {
        console.log("Profiler-setup");

        if (classs.prototype == null) {
            return;
        }

        Object.getOwnPropertyNames(classs.prototype).forEach(functionName => {
            console.log(functionName);
        });

        console.log("Profiler-end setup");
    }
}

interface DERP {
    prototype: any;
}