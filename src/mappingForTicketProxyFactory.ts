import { log } from '@graphprotocol/graph-ts'

import {
    ProxyCreated
} from '../generated/TicketProxyFactory/TicketProxyFactory'

import {
    ControlledToken as ControlledTokenTemplate
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
    log.warning("TicketProxyFactory created {}", [event.params.proxy.toHexString()])
    ControlledTokenTemplate.create(event.params.proxy)
}
  