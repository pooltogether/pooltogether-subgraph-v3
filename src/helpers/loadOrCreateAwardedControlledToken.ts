import { Address, log } from '@graphprotocol/graph-ts'
import { AwardedControlledToken } from '../../generated/schema'
import { generateCompositeId, ZERO } from './common'


export function loadOrCreateAwardedControlledToken(prizePoolAddress: string, winner: Address): AwardedControlledToken {
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

