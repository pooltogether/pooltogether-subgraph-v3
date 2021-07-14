import { Address } from '@graphprotocol/graph-ts'
import { PrizeSplit } from '../../generated/schema'
import { ZERO, ZERO_ADDRESS } from './common'

export function loadOrCreatePrizeSplit(prizeStrategy: string, index: string): PrizeSplit {
  const id = prizeStrategy + "-" + "-" + index.toString()
  let prizeSplit = PrizeSplit.load(id)

  if (!prizeSplit) {
    prizeSplit = new PrizeSplit(id)
    prizeSplit.target = Address.fromString(ZERO_ADDRESS)
    prizeSplit.tokenType = ZERO
    prizeSplit.percentage = ZERO
    prizeSplit.save()
  }
  return prizeSplit as PrizeSplit
}
