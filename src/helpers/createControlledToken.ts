import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  ControlledToken,
} from '../../generated/schema'

import {
  ControlledToken as ControlledTokenContract
} from '../../generated/templates/ControlledToken/ControlledToken'

import { ZERO } from './common'

export function createControlledToken(
  tokenType: string,
  tokenAddress: Address,
  prizePoolAddress: Address,
  prizeStrategyAddress: Address,
): ControlledToken {
  const token = new ControlledToken(tokenAddress.toHex())
  const boundToken = ControlledTokenContract.bind(tokenAddress)

  token.prizePool = prizePoolAddress.toHex()
  token.prizeStrategy = prizeStrategyAddress.toHex()

  token.type = tokenType
  token.name = boundToken.name()
  token.symbol = boundToken.symbol()
  token.decimals = BigInt.fromI32(boundToken.decimals())

  token.totalSupply = ZERO

  token.save()

  return token as ControlledToken
}
