import { describe, it, expect } from 'vitest';
import { AccountingEngine } from './AccountingEngine.js';

describe('AccountingEngine - Financial Integrity & Validation', () => {
  it('should reject journal entries with fewer than 2 lines', async () => {
    await expect(
      AccountingEngine.postBalancedJournalEntry({
        referenceType: 'test',
        referenceId: 1,
        description: 'Single line test',
        lines: [
          { accountCode: '1010', debit: 100, credit: 0 },
        ],
      })
    ).rejects.toThrow('يجب أن يحتوي القيد المحاسبي على طرفين على الأقل');
  });

  it('should reject journal entries with negative amounts', async () => {
    await expect(
      AccountingEngine.postBalancedJournalEntry({
        referenceType: 'test',
        referenceId: 2,
        description: 'Negative amounts test',
        lines: [
          { accountCode: '1010', debit: -50, credit: 0 },
          { accountCode: '4100', debit: 0, credit: -50 },
        ],
      })
    ).rejects.toThrow('لا يُسمح بالمبالغ السالبة');
  });

  it('should reject lines with both debit and credit equal to zero', async () => {
    await expect(
      AccountingEngine.postBalancedJournalEntry({
        referenceType: 'test',
        referenceId: 3,
        description: 'Zero lines test',
        lines: [
          { accountCode: '1010', debit: 0, credit: 0 },
          { accountCode: '4100', debit: 0, credit: 0 },
        ],
      })
    ).rejects.toThrow('لا يمكن تسجيل سطر قيد محاسبي بمبلغ صفر');
  });

  it('should reject unbalanced journal entries', async () => {
    await expect(
      AccountingEngine.postBalancedJournalEntry({
        referenceType: 'test',
        referenceId: 4,
        description: 'Unbalanced test',
        lines: [
          { accountCode: '1010', debit: 100, credit: 0 },
          { accountCode: '4100', debit: 0, credit: 95 },
        ],
      })
    ).rejects.toThrow('القيد المحاسبي غير متزن');
  });
});
