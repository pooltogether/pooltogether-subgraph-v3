import { Address, BigInt, log } from '@graphprotocol/graph-ts'

import {
  ControlledToken,
} from '../../generated/schema'

import {
  ControlledToken as ControlledTokenTemplate,
} from '../../generated/templates'

import {
  ControlledToken as ControlledTokenContract
} from '../../generated/templates/ControlledToken/ControlledToken'

import { ZERO } from './common'

export function createControlledToken(
  tokenAddress: Address,
  prizePoolAddress: Address,
): ControlledToken {
  const token = new ControlledToken(tokenAddress.toHex())
  const boundToken = ControlledTokenContract.bind(tokenAddress)

  token.prizePool = prizePoolAddress.toHex()

  token.name = boundToken.name()
  token.symbol = boundToken.symbol()

  let tryDecimalsCallResult = boundToken.try_decimals()
  if (tryDecimalsCallResult.reverted) {
    log.info('ERC20 try_decimals() call reverted', [])
  } else {
    token.decimals = BigInt.fromI32(tryDecimalsCallResult.value)
  }

  token.totalSupply = ZERO

  token.save()

  ControlledTokenTemplate.create(tokenAddress)

  return token as ControlledToken
}
