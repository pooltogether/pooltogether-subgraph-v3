import { Address } from "@graphprotocol/graph-ts"

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
