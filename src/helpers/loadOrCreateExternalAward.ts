import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  ERC20 as ERC20Contract,
} from '../../generated/templates/PrizePool/ERC20'

import {
  ExternalErc20Award,
  ExternalErc721Award,
} from '../../generated/schema'

import { externalAwardId } from './idTemplates'


export function loadOrCreateExternalErc20Award(prizeStrategyAddress: string, tokenAddress: Address): ExternalErc20Award {
  const awardId = externalAwardId(prizeStrategyAddress, tokenAddress.toHex())

  let award = ExternalErc20Award.load(awardId)
  if (!award) {
    award = new ExternalErc20Award(awardId)
    award.prizeStrategy = prizeStrategyAddress
    award.address = tokenAddress

    const boundToken = ERC20Contract.bind(tokenAddress)

    award.name = boundToken.name()
    award.symbol = boundToken.symbol()
    award.decimals = BigInt.fromI32(boundToken.decimals())

    award.save()
  }

  return award as ExternalErc20Award
}

export function loadOrCreateExternalErc721Award(prizeStrategyAddress: string, tokenAddress: Address): ExternalErc721Award {
  const awardId = externalAwardId(prizeStrategyAddress, tokenAddress.toHex())

  let award = ExternalErc721Award.load(awardId)
  if (!award) {
    award = new ExternalErc721Award(awardId)
    award.prizeStrategy = prizeStrategyAddress
    award.address = tokenAddress
    award.save()
  }

  return award as ExternalErc721Award
}
