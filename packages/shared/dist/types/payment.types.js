"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = exports.PaymentProvider = void 0;
var PaymentProvider;
(function (PaymentProvider) {
    PaymentProvider["CINETPAY"] = "CINETPAY";
    PaymentProvider["ORANGE_MONEY"] = "ORANGE_MONEY";
    PaymentProvider["MTN_MONEY"] = "MTN_MONEY";
    PaymentProvider["WAVE"] = "WAVE";
    PaymentProvider["MOOV_MONEY"] = "MOOV_MONEY";
})(PaymentProvider || (exports.PaymentProvider = PaymentProvider = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
//# sourceMappingURL=payment.types.js.map