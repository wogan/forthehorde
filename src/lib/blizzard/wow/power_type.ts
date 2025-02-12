import type { ApiIndex, ApiResponse } from "../model";

export type PowerTypeIndex = ApiIndex<'power_types'>

export interface PowerType extends ApiResponse {
    id: number
    name: string
}
