/**
 * PricingCalculator: محرك احتساب أوزان الشحن وتطبيق شرائح الأسعار حسب الوجهات
 */
export class PricingCalculator {
  /**
   * حساب الوزن الحجمي: (الطول × العرض × الارتفاع) / 5000
   * @param {number} lengthCm
   * @param {number} widthCm
   * @param {number} heightCm
   * @returns {number}
   */
  static calculateVolumetricWeight(lengthCm = 0, widthCm = 0, heightCm = 0) {
    if (!lengthCm || !widthCm || !heightCm) return 0;
    const vol = (Number(lengthCm) * Number(widthCm) * Number(heightCm)) / 5000;
    return Math.round(vol * 1000) / 1000;
  }

  /**
   * احتساب الوزن القابل للفوترة (الأكبر بين الفعلي والحجمي)
   * @param {number} actualWeightKg
   * @param {number} volumetricWeightKg
   * @returns {number}
   */
  static determineChargeableWeight(actualWeightKg, volumetricWeightKg) {
    const act = Number(actualWeightKg) || 0;
    const vol = Number(volumetricWeightKg) || 0;
    return Math.max(act, vol);
  }

  /**
   * تطبيق الشريحة وحساب إجمالي السعر مع معالجة الكيلو الإضافي بدقة
   * @param {number} weight
   * @param {Array} tiers
   */
  static evaluateRate(weight, tiers) {
    if (!tiers || tiers.length === 0) {
      throw new Error('لا توجد شرائح تسعير معرفة لهذه الوجهة');
    }

    const w = Number(weight) || 0;
    if (w <= 0) {
      throw new Error('الوزن المفوتر يجب أن يكون أكبر من الصفر');
    }

    // Sort tiers by minimum weight ascending
    const sortedTiers = [...tiers].sort((a, b) => a.weight_min_kg - b.weight_min_kg);

    // 1. المطابقة الدقيقة للشريحة مع إغلاق الفجوات العشرية بين الشرائح
    let matched = sortedTiers.find((t, idx) => {
      if (idx === 0) {
        return w >= t.weight_min_kg && w <= t.weight_max_kg;
      }
      return w > sortedTiers[idx - 1].weight_max_kg && w <= t.weight_max_kg;
    });

    // إذا لم تتطابق مباشرة، نبحث عن أول شريحة يقع الوزن دون حدها الأقصى
    if (!matched) {
      matched = sortedTiers.find(t => w <= t.weight_max_kg);
    }

    // في حال تجاوز الوزن أعلى شريحة معرفة، نعتمد الشريحة القصوى
    const tier = matched || sortedTiers[sortedTiers.length - 1];
    const extraKgPrice = Number(tier.extra_kg_price || 0);

    // 2. احتساب الكيلو الإضافي إذا كانت الشريحة تتضمن سعراً للكيلو الإضافي
    let extraKg = 0;
    if (extraKgPrice > 0) {
      // الكيلو الإضافي يبدأ بعد الحد الأدنى للشريحة (وزن الأساس)
      extraKg = Math.max(0, Math.ceil(w - tier.weight_min_kg));
    }

    const extraCharge = Math.round(extraKg * extraKgPrice * 100) / 100;
    const totalSalesPrice = Math.round((Number(tier.base_selling_price) + extraCharge) * 100) / 100;

    return {
      matchedTierId: tier.id,
      tierName: extraKg > 0 ? `${tier.tier_name} (+${extraKg} كجم إضافي)` : tier.tier_name,
      chargeableWeight: w,
      basePrice: Number(tier.base_selling_price),
      extraWeightKg: extraKg,
      extraKgPrice,
      extraCharge,
      totalSalesPrice,
      estimatedCost: Number(tier.estimated_cost || 0)
    };
  }
}
