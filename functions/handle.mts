export function handleCatch(reason: any): never {
    if (reason instanceof Error) throw reason;
    else throw new Error(reason)
}