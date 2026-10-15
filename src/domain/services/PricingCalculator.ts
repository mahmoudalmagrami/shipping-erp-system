import { BusinessRuleError } from '../errors/index.js';

export interface RateTier {
  id: number;
  name?: string;
  tierName?: string;
  minWeightKg?: string;
  maxWeightKg?: string;
  weightMinKg?: string;
  weightMaxKg?: string;
  basePrice?: string;
  baseSellingPrice?: string;
  extraKgPrice?: string;
  estimatedCost?: string | number;
  estCost?: string | number;
}

export interface RateResult {
  matchedTierId: number;
  tierName: string;
  chargeableWeight: number;
  basePrice: number;
  extraWeightKg: number;
  extraKgPrice: number;
  extraCharge: number;
  totalSalesPrice: number;
  estimatedCost: number;
}

export class PricingCalculator {
  // حساب الوزن الحجمي: (الطول × العرض × الارتفاع) / 5000
  static calculateVolumetricWeight(lengthCm: number, widthCm: number, heightCm: number): number {
    if (!lengthCm || !widthCm || !heightCm) return 0;
    const vol = (lengthCm * widthCm * heightCm) / 5000;
    return Math.round(vol * 1000) / 1000;
  }

  // تحديد الوزن القابل للفوترة (الأكبر بين الفعلي والحجمي)
  static determineChargeableWeight(actualWeight: number, volumetricWeight: number): number {
    return Math.max(actualWeight, volumetricWeight);
  }

  // تقييم التسعيرة بناءً على الوزن والشرائح
  static evaluateRate(weight: number, tiers: RateTier[]): RateResult {
    if (!tiers || tiers.length === 0) {
      throw new BusinessRuleError('لا توجد شرائح تسعير معرفة لهذه الوجهة');
    }

    const roundedWeight = Math.round(weight * 1000) / 1000;

    // فرز الشرائح تصاعدياً حسب الوزن الأدنى
    const sortedTiers = [...tiers].sort((a, b) => {
      const minA = Number(a.minWeightKg ?? a.weightMinKg ?? 0);
      const minB = Number(b.minWeightKg ?? b.weightMinKg ?? 0);
      return minA - minB;
    });

    const matchedTier = sortedTiers.find((tier, idx) => {
      const min = Number(tier.minWeightKg ?? tier.weightMinKg ?? 0);
      const max = Number(tier.maxWeightKg ?? tier.weightMaxKg ?? 999999);
      if (idx === 0) {
        return roundedWeight >= min && roundedWeight <= max;
      }
      return (roundedWeight > min || Math.abs(roundedWeight - min) <= 0.001) && roundedWeight <= max;
    });

    const selectedTier = matchedTier || sortedTiers[sortedTiers.length - 1];
    if (!selectedTier) {
      throw new BusinessRuleError('لا توجد شريحة تسعير مناسبة لهذا الوزن');
    }

    const basePrice = Number(selectedTier.basePrice ?? selectedTier.baseSellingPrice ?? 0);
    const extraKgPrice = Number(selectedTier.extraKgPrice ?? 0);
    const minWeight = Number(selectedTier.minWeightKg ?? selectedTier.weightMinKg ?? 0);

    let extraWeightKg = 0;
    if (extraKgPrice > 0) {
      extraWeightKg = Math.max(0, Math.ceil(roundedWeight - minWeight));
    }

    const extraCharge = Math.round(extraWeightKg * extraKgPrice * 100) / 100;
    const totalSalesPrice = Math.round((basePrice + extraCharge) * 100) / 100;
    const tierCost = Number(selectedTier.estimatedCost ?? selectedTier.estCost ?? 0);
    const estimatedCost = tierCost > 0 ? tierCost : Math.round(totalSalesPrice * 0.6 * 100) / 100;

    return {
      matchedTierId: selectedTier.id,
      tierName: selectedTier.name ?? selectedTier.tierName ?? 'الشريحة المطبقة',
      chargeableWeight: weight,
      basePrice,
      extraWeightKg,
      extraKgPrice,
      extraCharge,
      totalSalesPrice,
      estimatedCost,
    };
  }
}
