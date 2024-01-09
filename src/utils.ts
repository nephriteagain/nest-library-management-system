import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * 
 * @param query query params
 * @description throws an error if there is more than one defined query params
 */
export function queryLengthChecker(query: Record<string,any>) : void {
    let queryLength = 0;
    for (const v of Object.values(query)){
        if (v !== undefined) queryLength++
    }
    if (queryLength > 1) {
        throw new HttpException('only one query param allowed!', HttpStatus.BAD_REQUEST)
    }
}