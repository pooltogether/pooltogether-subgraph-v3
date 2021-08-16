import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  ERC20 as ERC20Contract,
} from '../../generated/templates/PrizePool_v3_0_1/ERC20'

import {
  Prize,
  AwardedExternalErc20Token,
  AwardedExternalErc721Nft,
  PrizeStrategy,
} from '../../generated/schema'

import { awardedExternalErc20TokenId, awardedExternalErc721NftId } from './idTemplates'
import { loadOrCreateExternalErc721Award } from './loadOrCreateExternalAward'

export function loadOrCreateAwardedExternalErc20Token(prize: Prize, tokenAddress: Address, winnerAddress: Address, winnerIndex: string): AwardedExternalErc20Token {
  const awardId = awardedExternalErc20TokenId(prize.id, tokenAddress.toHex(), winnerAddress.toHex(), winnerIndex)

  let award = AwardedExternalErc20Token.load(awardId)
  if (!award) {
    award = new AwardedExternalErc20Token(awardId)
    award.prize = prize.id
    award.address = tokenAddress

    const boundToken = ERC20Contract.bind(tokenAddress)

    
    let tryNameCallResult = boundToken.try_name()
    if (tryNameCallResult.reverted) {
      log.info('ERC20 try_name() call reverted', [])
    } else {
      award.name = tryNameCallResult.value
    }

    let trySymbolCallResult = boundToken.try_symbol()
    if (trySymbolCallResult.reverted) {
      log.info('ERC20 try_symbol call reverted', [])
    } else {
      award.symbol = trySymbolCallResult.value
    }

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
