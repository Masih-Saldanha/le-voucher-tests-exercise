import { jest } from "@jest/globals";

import { Voucher } from "@prisma/client";
import voucherRepository from "repositories/voucherRepository";
import voucherService from "services/voucherService";

describe("Voucher Tests", () => {
    it("Should create a Voucher", async () => {
        const voucherData: Voucher = { id: 1, code: "abc123", discount: 50, used: false }

        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(undefined);
        jest.spyOn(voucherRepository, "createVoucher").mockResolvedValueOnce(voucherData);

        const result = await voucherService.createVoucher(voucherData.code, voucherData.discount);

        expect(result).toBe(undefined)
    });

    it("Should not create a Voucher for already repeated voucher", async () => {
        expect(async () => {
            const voucherData: Voucher = { id: 1, code: "abc123", discount: 50, used: false }

            jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucherData);

            await voucherService.createVoucher(voucherData.code, voucherData.discount);

        }).rejects.toStrictEqual({ type: 'conflict', message: 'Voucher already exist.' });
    });

    it("Should apply the Voucher", async () => {
        const amount = 100;
        const voucherData: Voucher = { id: 1, code: "abc123", discount: 50, used: false }

        jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(voucherData);
        jest.spyOn(voucherRepository, "useVoucher").mockResolvedValueOnce({ ...voucherData, used: true });

        const result = await voucherService.applyVoucher(voucherData.code, amount);

        expect(result).toStrictEqual({ amount, discount: voucherData.discount, finalAmount: amount - (amount * (voucherData.discount / 100)), applied: true })
    });

    it("Should not apply the Voucher for the voucher doesn't exist", () => {
        expect(async () => {
            const amount = 100;
            const voucherData: Voucher = { id: 1, code: "abc123", discount: 50, used: false }

            jest.spyOn(voucherRepository, "getVoucherByCode").mockResolvedValueOnce(undefined);

            await voucherService.applyVoucher(voucherData.code, amount);

        }).rejects.toStrictEqual({ type: 'conflict', message: 'Voucher does not exist.' });
    });
});