import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { destinationZones, pricingMatrix } from '../db/schema.js';
import { PricingCalculator } from '../domain/services/PricingCalculator.js';
import { NotFoundError, BusinessRuleError } from '../domain/errors/index.js';

const schema = z.object({
  zoneId: z.number().int().positive('يجب اختيار وجهة شحن صالحة'),
  actualWeight: z.number().positive('الوزن يجب أن يكون أكبر من الصفر'),
  lengthCm: z.number().optional().default(0),
  widthCm: z.number().optional().default(0),
  heightCm: z.number().optional().default(0)
});

export class CalculateRate {
  static async execute(input: unknown) {
    const raw = input as any;
    const data = schema.parse({
      zoneId: Number(raw.zoneId ?? raw.destinationZoneId),
      actualWeight: Number(raw.actualWeight ?? raw.actualWeightKg),
      lengthCm: Number(raw.lengthCm ?? raw.length ?? 0),
      widthCm: Number(raw.widthCm ?? raw.width ?? 0),
      heightCm: Number(raw.heightCm ?? raw.height ?? 0),
    });

    const zone = (await db.select().from(destinationZones).where(eq(destinationZones.id, data.zoneId)).limit(1))[0];
    if (!zone) {
      throw new NotFoundError('وجهة الشحن المحددة غير موجودة');
    }

    const tiers = await db
      .select()
      .from(pricingMatrix)
      .where(and(eq(pricingMatrix.zoneId, data.zoneId), eq(pricingMatrix.isActive, true)));

    if (!tiers || tiers.length === 0) {
      throw new BusinessRuleError(`لا توجد شرائح تسعير مفعلة لوجهة: ${zone.nameAr}`);
    }

    const volumetricWeight = PricingCalculator.calculateVolumetricWeight(
      data.lengthCm,
      data.widthCm,
      data.heightCm
    );
    
    const chargeableWeight = PricingCalculator.determineChargeableWeight(data.actualWeight, volumetricWeight);
    const rate = PricingCalculator.evaluateRate(chargeableWeight, tiers as any);

    return {
      zone: {
        id: zone.id,
        zoneCode: zone.zoneCode,
        nameAr: zone.nameAr,
        nameEn: zone.nameEn,
      },
      actualWeight: data.actualWeight,
      volumetricWeight,
      chargeableWeight,
      tierName: rate.tierName,
      basePrice: rate.basePrice,
      extraKgPrice: rate.extraKgPrice,
      extraWeightKg: rate.extraWeightKg,
      extraCharge: rate.extraCharge,
      totalSalesPrice: rate.totalSalesPrice,
      estimatedCost: rate.estimatedCost,
    };
  }
}
