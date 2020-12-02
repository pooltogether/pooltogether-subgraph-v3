import { log, Address } from '@graphprotocol/graph-ts'

import {
  CompoundPrizePool,
} from '../../generated/schema'

import {
  CompoundPrizePool as CompoundPrizePoolTemplate,
} from '../../generated/templates'

import {
  CompoundPrizePool as CompoundPrizePoolContract,
} from '../../generated/templates/CompoundPrizePool/CompoundPrizePool'

import { loadOrCreatePrizePool } from './loadOrCreatePrizePool'


export function loadOrCreateCompoundPrizePool(
  prizePool: Address
): CompoundPrizePool {
  let _compoundPrizePool = CompoundPrizePool.load(prizePool.toHex())
  log.warning('CPP event.params.proxy {}', [prizePool.toHexString()])

  if (!_compoundPrizePool) {
    _compoundPrizePool = new CompoundPrizePool(prizePool.toHex())

    const _prizePool = loadOrCreatePrizePool(prizePool)
    _prizePool.prizePoolType = 'Compound'
    _prizePool.compoundPrizePool = _compoundPrizePool.id
    _prizePool.save()

    const _boundCompoundPrizePool = CompoundPrizePoolContract.bind(prizePool)
    _compoundPrizePool.cToken = _boundCompoundPrizePool.cToken()
    _compoundPrizePool.save()

    // Start listening for events from the dynamically generated contract
    CompoundPrizePoolTemplate.create(prizePool)
  }

  return _compoundPrizePool as CompoundPrizePool
}
