export type Refine<T, V extends keyof T, U extends T[V]> = {
    [P in keyof T]: P extends V ? U : T[P]
}

export const sleep = async (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};