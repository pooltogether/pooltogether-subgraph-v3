import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  ERC20 as ERC20Contract,
} from '../../generated/templates/PrizePool/ERC20'

import {
  Prize,
  AwardedExternalErc20Token,
  AwardedExternalErc721Nft,
  ExternalErc721Award,
  PrizeStrategy,
} from '../../generated/schema'

import { awardedExternalErc20TokenId, awardedExternalErc721NftId } from './idTemplates'
import { loadOrCreateExternalErc721Award } from './loadOrCreateExternalAward'

export function loadOrCreateAwardedExternalErc20Token(prize: Prize, tokenAddress: Address): AwardedExternalErc20Token {
  const awardId = awardedExternalErc20TokenId(prize.id, tokenAddress.toHex())

  let award = AwardedExternalErc20Token.load(awardId)
  if (!award) {
    award = new AwardedExternalErc20Token(awardId)
    award.prize = prize.id
    award.address = tokenAddress

    const boundToken = ERC20Contract.bind(tokenAddress)

    award.name = boundToken.name()
    award.symbol = boundToken.symbol()

    let tryDecimalsCallResult = boundToken.try_decimals()
    if (tryDecimalsCallResult.reverted) {
      log.info('ERC20 try_decimals() call reverted', [])
    } else {
      award.decimals = BigInt.fromI32(tryDecimalsCallResult.value)
    }

    award.save()
  }

  return award as AwardedExternalErc20Token
}

export function loadOrCreateAwardedExternalErc721Nft(prize: Prize, prizeStrategy: PrizeStrategy, tokenAddress: Address): AwardedExternalErc721Nft {
  const awardId = awardedExternalErc721NftId(prize.id, tokenAddress.toHex())

  let award = AwardedExternalErc721Nft.load(awardId)
  if (!award) {
    award = new AwardedExternalErc721Nft(awardId)

    let externalErc721Award = loadOrCreateExternalErc721Award(
      prizeStrategy.id.toString(),
      tokenAddress
    )
    
    award.address = externalErc721Award.address
    award.prize = prize.id
    award.tokenIds = externalErc721Award.tokenIds

    award.save()
  }

  return award as AwardedExternalErc721Nft
}
