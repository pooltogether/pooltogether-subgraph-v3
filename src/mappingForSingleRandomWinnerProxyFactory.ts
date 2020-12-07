import { log } from '@graphprotocol/graph-ts'
import {
  ProxyCreated,
} from '../generated/SingleRandomWinnerProxyFactory/SingleRandomWinnerProxyFactory'

import {
  SingleRandomWinner as SingleRandomWinnerTemplate,
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
  log.warning("\n \n creating a SingleRandomWinner at : {}", [event.params.proxy.toHex()])
  SingleRandomWinnerTemplate.create(event.params.proxy)
}
