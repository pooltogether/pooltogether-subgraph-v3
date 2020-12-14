import { Address, log } from '@graphprotocol/graph-ts'
import { AwardedControlledToken } from '../../generated/schema'
import { ZERO } from './common'


export function loadOrCreateAwardedControlledToken(prizePoolAddress: string, winner: Address): AwardedControlledToken {
    log.warning("LOADORCREATE AWARDED CONTROLLED TOKEN ",[])
    let awardedControlledToken = AwardedControlledToken.load(generateCompositeId(prizePoolAddress, winner.toHexString()))
    if(!awardedControlledToken){ // create new
        awardedControlledToken = new AwardedControlledToken(generateCompositeId(prizePoolAddress, winner.toHexString()))
        awardedControlledToken.winner = winner
        // temp values
        awardedControlledToken.amount = ZERO
        awardedControlledToken.token = null
    }

    return awardedControlledToken as AwardedControlledToken
}

function generateCompositeId(key1: string , key2: string) : string {
    return key1 + key2
}