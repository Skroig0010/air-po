import { EventNotifier } from '@utils/eventNotifier'

export type EquipmentTypes = 'AirTank'

export class EquipmentComponent {
  public airTank = {
    count: 0,
    quantity: 400,
  }
  public equipEvent = new EventNotifier<EquipmentTypes>()
}
