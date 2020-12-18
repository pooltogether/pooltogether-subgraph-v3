import { Address } from '@graphprotocol/graph-ts'
import { AwardedControlledToken } from '../../generated/schema'
import { generateAwardedControlledTokenCompositeId, ZERO } from './common'


export function loadOrCreateAwardedControlledToken(prizePoolAddress: string, winner: Address, currentPrizePoolId: string, winnerIndex: string): AwardedControlledToken {
    let awardedControlledToken = AwardedControlledToken.load(generateAwardedControlledTokenCompositeId(prizePoolAddress, winner.toHexString(),currentPrizePoolId, winnerIndex))
    if(!awardedControlledToken){ // create new
        awardedControlledToken = new AwardedControlledToken(generateAwardedControlledTokenCompositeId(prizePoolAddress, winner.toHexString(),currentPrizePoolId, winnerIndex))
        awardedControlledToken.winner = winner
        // temp values
        awardedControlledToken.amount = ZERO
        awardedControlledToken.token = null
    }

    return awardedControlledToken as AwardedControlledToken
}

