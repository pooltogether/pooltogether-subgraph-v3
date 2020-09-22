import {
  CompoundPrizePool,
} from '../generated/schema'

import {
  CompoundPrizePoolInitialized,
} from '../generated/templates/CompoundPrizePool/CompoundPrizePool'

export function handleCompoundPrizePoolInitialized(event: CompoundPrizePoolInitialized): void {
  const _compoundPrizePool = CompoundPrizePool.load(event.address.toHex())
  _compoundPrizePool.cToken = event.params.cToken
  _compoundPrizePool.save()
}
