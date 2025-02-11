export type Refine<T, V extends keyof T, U extends T[V]> = {
    [P in keyof T]: P extends V ? U : T[P]
}
