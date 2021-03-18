import {
  CompoundPrizePoolInitialized,
} from '../generated/templates/CompoundPrizePool/CompoundPrizePool' // but any should do since its the same event for all

import { loadOrCreateCompoundPrizePool } from './helpers/loadOrCreateCompoundPrizePool'

// the initialised event is the same for all compound prize pools so just one handler required
// called form the data source template

export function handleCompoundPrizePoolInitialized(event: CompoundPrizePoolInitialized): void {
  const _compoundPrizePool = loadOrCreateCompoundPrizePool(event.address)
  _compoundPrizePool.cToken = event.params.cToken
  _compoundPrizePool.save()
}
