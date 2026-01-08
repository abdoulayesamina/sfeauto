// src/utils/types/intervention.ts
export interface CreateInterventionData {
  vehicleId: string          
  accordNumber: string       
  dateOfConfirmation: string
  workDescription?: string  
  didOrderParts?: boolean   
  ordersDetails?: string     
  comments?: string          
}
