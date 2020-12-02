import { log } from '@graphprotocol/graph-ts'

import {
  CompoundPrizePoolInitialized,
} from '../generated/templates/CompoundPrizePool/CompoundPrizePool'

import { loadOrCreateCompoundPrizePool } from './helpers/loadOrCreateCompoundPrizePool'

export function handleCompoundPrizePoolInitialized(event: CompoundPrizePoolInitialized): void {
  log.warning("CREATING COMPOUND PRIZE POOL", [event.address.toHex()])
  const _compoundPrizePool = loadOrCreateCompoundPrizePool(event.address)
  _compoundPrizePool.cToken = event.params.cToken
  _compoundPrizePool.save()
}
