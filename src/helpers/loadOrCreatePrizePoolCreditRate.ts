import { Address } from '@graphprotocol/graph-ts'

import {
  CreditRate,
} from '../../generated/schema'

import {
  creditRateId,
} from './idTemplates'

import { ZERO } from './common'


export function loadOrCreatePrizePoolCreditRate(
  prizePool: Address,
  controlledToken: Address,
): CreditRate {
  const _creditRateId = creditRateId(prizePool.toHex(), controlledToken.toHex())
  let _creditRate = CreditRate.load(_creditRateId)
  if (!_creditRate) {
    _creditRate = new CreditRate(_creditRateId)

    _creditRate.prizePool = prizePool.toHex()
    _creditRate.creditLimitMantissa = ZERO
    _creditRate.creditRateMantissa = ZERO

    _creditRate.save()
  }
  return _creditRate as CreditRate
}
