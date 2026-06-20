"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscrowStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OrderStatus["COMPLETED"] = "COMPLETED";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["DISPUTED"] = "DISPUTED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var EscrowStatus;
(function (EscrowStatus) {
    EscrowStatus["NOT_FUNDED"] = "NOT_FUNDED";
    EscrowStatus["FUNDED"] = "FUNDED";
    EscrowStatus["RELEASED"] = "RELEASED";
    EscrowStatus["REFUNDED"] = "REFUNDED";
    EscrowStatus["DISPUTED"] = "DISPUTED";
})(EscrowStatus || (exports.EscrowStatus = EscrowStatus = {}));
//# sourceMappingURL=order.types.js.map