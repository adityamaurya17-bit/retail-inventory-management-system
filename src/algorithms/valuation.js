// Inventory Cost Valuation Engine: FIFO vs Moving Weighted Average (AVCO)

export class ValuationEngine {
  /**
   * Simulates FIFO inventory depletion from chronological cost layers.
   * costLayers: Array of { batchId, quantity, unitCost, receivedDate }
   * unitsToDeplete: number
   */
  static computeFIFO(costLayers, unitsToDeplete) {
    const layers = JSON.parse(JSON.stringify(costLayers));
    let remainingToDeplete = unitsToDeplete;
    let cogsTotal = 0;
    const consumedLayers = [];

    for (const layer of layers) {
      if (remainingToDeplete <= 0) break;
      const take = Math.min(layer.quantity, remainingToDeplete);
      const costPortion = take * layer.unitCost;
      cogsTotal += costPortion;
      layer.quantity -= take;
      remainingToDeplete -= take;

      consumedLayers.push({
        batchId: layer.batchId,
        consumedQty: take,
        unitCost: layer.unitCost,
        costTotal: costPortion
      });
    }

    // Remaining inventory value
    const remainingStockValue = layers.reduce((acc, l) => acc + l.quantity * l.unitCost, 0);
    const remainingUnits = layers.reduce((acc, l) => acc + l.quantity, 0);

    return {
      model: "FIFO",
      cogsTotal,
      averageUnitCogs: unitsToDeplete > 0 ? cogsTotal / unitsToDeplete : 0,
      remainingStockValue,
      remainingUnits,
      consumedLayers,
      remainingLayers: layers.filter((l) => l.quantity > 0)
    };
  }

  /**
   * Simulates Moving Weighted Average Cost (AVCO).
   */
  static computeAVCO(costLayers, unitsToDeplete) {
    const totalUnits = costLayers.reduce((acc, l) => acc + l.quantity, 0);
    const totalCost = costLayers.reduce((acc, l) => acc + l.quantity * l.unitCost, 0);
    const weightedAvgUnitCost = totalUnits > 0 ? totalCost / totalUnits : 0;

    const actualDeplete = Math.min(totalUnits, unitsToDeplete);
    const cogsTotal = actualDeplete * weightedAvgUnitCost;
    const remainingUnits = Math.max(0, totalUnits - actualDeplete);
    const remainingStockValue = remainingUnits * weightedAvgUnitCost;

    return {
      model: "AVCO (Moving Weighted Average)",
      weightedAvgUnitCost,
      cogsTotal,
      remainingStockValue,
      remainingUnits
    };
  }
}
