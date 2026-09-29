// Reorder Point (ROP), Safety Stock (SS), and Economic Order Quantity (EOQ) Engine

export const SERVICE_LEVEL_Z = {
  "90%": 1.282,
  "95%": 1.645,
  "98%": 2.054,
  "99%": 2.326,
  "99.9%": 3.090
};

/**
 * Calculates Safety Stock ($SS$) based on demand variance and lead-time variance:
 * SS = Z * sqrt( (L * sigma_d^2) + (d^2 * sigma_L^2) )
 */
export function calculateSafetyStock(dailyDemand, leadTimeDays, sigmaDemand, sigmaLeadTime, serviceLevel = "95%") {
  const Z = SERVICE_LEVEL_Z[serviceLevel] || 1.645;
  const varianceDemand = Math.pow(sigmaDemand, 2);
  const varianceLeadTime = Math.pow(sigmaLeadTime, 2);

  const combinedVariance = leadTimeDays * varianceDemand + Math.pow(dailyDemand, 2) * varianceLeadTime;
  const safetyStock = Math.ceil(Z * Math.sqrt(combinedVariance));
  return Math.max(1, safetyStock);
}

/**
 * Computes Reorder Point ($ROP$):
 * ROP = (d * L) + SS
 */
export function calculateROP(dailyDemand, leadTimeDays, safetyStock) {
  const leadTimeDemand = Math.round(dailyDemand * leadTimeDays);
  return leadTimeDemand + safetyStock;
}

/**
 * Computes Economic Order Quantity ($EOQ$):
 * EOQ = sqrt( (2 * AnnualDemand * OrderCost) / HoldingCostPerUnitYear )
 */
export function calculateEOQ(annualDemand, orderingCostFixed, unitCost, holdingRateAnnual = 0.20) {
  const holdingCostUnitYear = unitCost * holdingRateAnnual;
  if (holdingCostUnitYear <= 0) return 50;
  const eoq = Math.round(Math.sqrt((2 * annualDemand * orderingCostFixed) / holdingCostUnitYear));
  return Math.max(10, eoq);
}
