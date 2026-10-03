import { z } from 'zod';
import { db } from '../config/database.js';
import { PricingCalculator } from '../domain/services/PricingCalculator.js';

const CalculateRateSchema = z.object({
  zoneId: z.number().int().positive('يجب اختيار وجهة شحن صالحة'),
  actualWeight: z.number().positive('الوزن يجب أن يكون أكبر من الصفر').max(5000, 'الوزن يتجاوز الحد المسموح به'),
  length: z.number().min(0).optional().default(0),
  width: z.number().min(0).optional().default(0),
  height: z.number().min(0).optional().default(0)
});

export class CalculateRateUseCase {
  static execute(input) {
    const validated = CalculateRateSchema.parse({
      zoneId: Number(input.zoneId),
      actualWeight: Number(input.actualWeight),
      length: Number(input.length || 0),
      width: Number(input.width || 0),
      height: Number(input.height || 0)
    });

    const act = validated.actualWeight;
    const l = validated.length;
    const w = validated.width;
    const h = validated.height;
    const zoneId = validated.zoneId;

    const zone = db.prepare('SELECT id, zone_code, name_ar FROM destination_zones WHERE id = ?').get(zoneId);
    if (!zone) {
      throw new Error('الوجهة المحددة غير صالحة');
    }

    const tiers = db.prepare(`
      SELECT * FROM pricing_matrix 
      WHERE zone_id = ? AND is_active = 1 
      ORDER BY weight_min_kg ASC
    `).all(zoneId);

    const volumetricWeight = PricingCalculator.calculateVolumetricWeight(l, w, h);
    const chargeableWeight = PricingCalculator.determineChargeableWeight(act, volumetricWeight);

    const result = PricingCalculator.evaluateRate(chargeableWeight, tiers);

    return {
      zone,
      actualWeight: act,
      volumetricWeight,
      chargeableWeight,
      tierName: result.tierName,
      basePrice: result.basePrice,
      extraKgPrice: result.extraKgPrice,
      extraWeightKg: result.extraWeightKg,
      extraCharge: result.extraCharge,
      totalSalesPrice: result.totalSalesPrice,
      estimatedCost: result.estimatedCost
    };
  }
}
