import { describe, it, expect } from 'vitest';
import { PricingCalculator } from './PricingCalculator.js';

describe('PricingCalculator', () => {
  it('should accurately calculate volumetric weight using (L*W*H)/5000', () => {
    // 50 x 40 x 30 cm = 60,000 / 5000 = 12.0 kg
    const volWeight = PricingCalculator.calculateVolumetricWeight(50, 40, 30);
    expect(volWeight).toBe(12);
  });

  it('should return 0 volumetric weight if any dimension is missing or zero', () => {
    expect(PricingCalculator.calculateVolumetricWeight(0, 40, 30)).toBe(0);
    expect(PricingCalculator.calculateVolumetricWeight(50, 0, 30)).toBe(0);
    expect(PricingCalculator.calculateVolumetricWeight(50, 40, 0)).toBe(0);
  });

  it('should determine chargeable weight as the maximum of actual and volumetric weight', () => {
    expect(PricingCalculator.determineChargeableWeight(5, 12)).toBe(12);
    expect(PricingCalculator.determineChargeableWeight(15, 12)).toBe(15);
  });

  it('should evaluate rate properly against defined tiers without extra kg', () => {
    const tiers = [
      { id: 1, name: 'Light', minWeightKg: '0', maxWeightKg: '1', basePrice: '25', extraKgPrice: '0' },
      { id: 2, name: 'Medium', minWeightKg: '1.001', maxWeightKg: '5', basePrice: '45', extraKgPrice: '0' },
      { id: 3, name: 'Heavy', minWeightKg: '5.001', maxWeightKg: '999', basePrice: '75', extraKgPrice: '5' },
    ];

    const result = PricingCalculator.evaluateRate(3.5, tiers);
    expect(result.matchedTierId).toBe(2);
    expect(result.basePrice).toBe(45);
    expect(result.extraWeightKg).toBe(0);
    expect(result.totalSalesPrice).toBe(45);
  });

  it('should correctly calculate extra kg price for heavy tiers', () => {
    const tiers = [
      { id: 1, name: 'Heavy', minWeightKg: '10', maxWeightKg: '999', basePrice: '75', extraKgPrice: '5' },
    ];

    // 14 kg = 10 base + 4 extra kg @ 5 = 75 + 20 = 95
    const result = PricingCalculator.evaluateRate(14, tiers);
    expect(result.extraWeightKg).toBe(4);
    expect(result.extraCharge).toBe(20);
    expect(result.totalSalesPrice).toBe(95);
  });
});
