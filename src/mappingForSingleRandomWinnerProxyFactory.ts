import {
  ProxyCreated, // note that the version doesn't matter here, it's just the way the generated code works
} from '../generated/SingleRandomWinnerProxyFactory_v3_1_0/SingleRandomWinnerProxyFactory'

import {
  SingleRandomWinner as SingleRandomWinnerTemplate,
} from '../generated/templates'

export function handleProxyCreated(event: ProxyCreated): void {
  SingleRandomWinnerTemplate.create(event.params.proxy)
}
