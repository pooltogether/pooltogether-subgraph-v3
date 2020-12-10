import {
    ProxyCreated,
  } from '../generated/ControlledTokenProxyFactory_v3_1_0/ControlledTokenProxyFactory_v3_1_0'
  
import {
    ControlledToken as ControlledTokenTemplate,
} from '../generated/templates'
 
export function handleProxyCreated(event: ProxyCreated): void {
    ControlledTokenTemplate.create(event.params.proxy)
}
