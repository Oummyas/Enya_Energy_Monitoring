// An active meter below this consumption is flagged as a possible fraud
export const FRAUD_THRESHOLD_KWH = 100;

export function isSuspectedFraud(meter: {
  is_active: boolean;
  consumption: number;
}) {
  return meter.is_active && Number(meter.consumption) < FRAUD_THRESHOLD_KWH;
}
