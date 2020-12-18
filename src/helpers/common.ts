import { BigInt } from '@graphprotocol/graph-ts'

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

export const ZERO = BigInt.fromI32(0)
export const ONE = BigInt.fromI32(1)

export function generateCompositeId(key1: string , key2: string) : string {
    return key1 + "-" + key2
}

export function generateAwardedControlledTokenCompositeId(key1: string , key2: string, key3: string, key4: string) : string {
    return key1 + "-" + key2 + "-" + key3 + "-" + key4
}