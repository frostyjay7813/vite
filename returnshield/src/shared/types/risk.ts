export type RiskLevel = 'low' | 'review' | 'high'

export type RiskReasonCode =
  | 'HIGH_RETURN_RATE'
  | 'RETURN_VELOCITY'
  | 'ITEM_NOT_RECEIVED'
  | 'ADDRESS_CLUSTER'
  | 'HIGH_VALUE_ORDER'
  | 'POSITIVE_CUSTOMER_HISTORY'

export type ReturnRiskAssessment = {
  caseId: string
  shopId: string
  orderId: string
  customerId: string
  score: number
  level: RiskLevel
  reasonCodes: RiskReasonCode[]
  createdAt: string
}
