export class Profiler {
    public static setup<T>(thing: T, label: string): void {
        console.log("Profiler-setup");

        Object.getOwnPropertyNames(thing).forEach(functionName => {
            if (excludeList.indexOf(functionName) === -1) {
                const extendedLabel = `${label}.${functionName}`;
                console.log(functionName);

                const descriptor = Object.getOwnPropertyDescriptor(thing, functionName);
                if (!descriptor) {
                    return;
                }

                const hasAccessor = descriptor.get || descriptor.set;
                if (hasAccessor) {
                    const configurable = descriptor.configurable;
                    if (!configurable) {
                        return;
                    }

                    const profileDescriptor: any = {};

                    if (descriptor.get) {
                        const extendedLabelGet = `${extendedLabel}:get`;
                        profileDescriptor.get = profileFunction(descriptor.get, extendedLabelGet);
                    }

                    if (descriptor.set) {
                        const extendedLabelSet = `${extendedLabel}:set`;
                        profileDescriptor.set = profileFunction(descriptor.set, extendedLabelSet);
                    }

                    Object.defineProperty(thing, functionName, profileDescriptor);
                    return;
                }

                const isFunction = typeof descriptor.value === "function";
                if (!isFunction) {
                    return;
                }
                const originalFunction = (thing as any)[functionName];
                (thing as any)[functionName] = profileFunction(originalFunction, extendedLabel);
            }
        });

        console.log("Profiler-end setup");
    }
}

let depth = 0;

const excludeList: string[] = ["prototype", "length"];

function profileFunction(fn: any, functionName: any): any {
    const fnName = functionName || fn.name;
    if (!fnName) {
        console.log("Couldn't find a function name for - ", fn);
        console.log("Will not profile this function.");
        return fn;
    }

    return wrapFunction(fnName, fn);
}


function wrapFunction(name: any, originalFunction: any): any {
    if (originalFunction.profilerWrapped) {
        throw new Error("ERR1");
    }

    function wrappedFunction(): any {
        const nameMatchesFilter = name === getFilter();
        const start = Game.cpu.getUsed();
        if (nameMatchesFilter) {
            depth++;
        }
        // @ts-ignore
        const result = originalFunction.apply(this, arguments);
        if (depth > 0 || !getFilter()) {
            const end = Game.cpu.getUsed();
            // Profiler.record(name, end - start); TODO
            console.log(end - start);
        }
        if (nameMatchesFilter) {
            depth--;
        }
        return result;
    }

    wrappedFunction.profilerWrapped = true;
    wrappedFunction.toString = () =>
        `// screeps-profiler wrapped function:\n${originalFunction.toString()}`;

    return wrappedFunction;
}

function getFilter(): any {
    return Memory.profiler.filter;
}