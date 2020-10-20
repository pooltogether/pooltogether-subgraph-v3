import {
  CompoundPrizePoolInitialized,
} from '../generated/templates/CompoundPrizePool/CompoundPrizePool'

import { loadOrCreateCompoundPrizePool } from './helpers/loadOrCreateCompoundPrizePool'

export function handleCompoundPrizePoolInitialized(event: CompoundPrizePoolInitialized): void {
  const _compoundPrizePool = loadOrCreateCompoundPrizePool(event.address)
  _compoundPrizePool.cToken = event.params.cToken
  _compoundPrizePool.save()
}
