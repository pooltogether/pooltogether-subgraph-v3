import {
    ProxyCreated,
  } from '../generated/ControlledTokenProxyFactory_v3_1_0/ControlledTokenProxyFactory'
  
import {
    ControlledToken as ControlledTokenTemplate,
} from '../generated/templates'
 
export function handleProxyCreated(event: ProxyCreated): void {
    ControlledTokenTemplate.create(event.params.proxy)
}
  