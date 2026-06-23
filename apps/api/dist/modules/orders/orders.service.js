"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const artisan_entity_1 = require("../artisans/entities/artisan.entity");
let OrdersService = class OrdersService {
    constructor(ordersRepo, artisansRepo) {
        this.ordersRepo = ordersRepo;
        this.artisansRepo = artisansRepo;
    }
    async create(client, data) {
        const artisan = await this.artisansRepo.findOne({ where: { id: data.artisanId } });
        if (!artisan)
            throw new common_1.NotFoundException('Artisan not found');
        if (!artisan.isAvailable)
            throw new common_1.BadRequestException('Artisan is not available');
        const order = this.ordersRepo.create({
            client,
            artisan,
            description: data.description,
            scheduledAt: data.scheduledAt,
            address: data.address,
            city: data.city,
            notes: data.notes,
            status: order_entity_1.OrderStatus.PENDING,
            escrowStatus: order_entity_1.EscrowStatus.NOT_FUNDED,
        });
        return this.ordersRepo.save(order);
    }
    async findByClient(clientId) {
        return this.ordersRepo.find({
            where: { client: { id: clientId } },
            relations: ['artisan', 'artisan.user'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByArtisan(artisanId) {
        return this.ordersRepo.find({
            where: { artisan: { id: artisanId } },
            relations: ['client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        const order = await this.ordersRepo.findOne({
            where: { id },
            relations: ['client', 'artisan', 'artisan.user'],
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async confirm(orderId, artisanUserId) {
        const order = await this.findById(orderId);
        if (order.artisan.user.id !== artisanUserId)
            throw new common_1.ForbiddenException();
        if (order.status !== order_entity_1.OrderStatus.PENDING)
            throw new common_1.BadRequestException('Order cannot be confirmed');
        order.status = order_entity_1.OrderStatus.CONFIRMED;
        return this.ordersRepo.save(order);
    }
    async markInProgress(orderId) {
        const order = await this.findById(orderId);
        if (order.status !== order_entity_1.OrderStatus.CONFIRMED)
            throw new common_1.BadRequestException('Order must be confirmed first');
        if (order.escrowStatus !== order_entity_1.EscrowStatus.FUNDED)
            throw new common_1.BadRequestException('Payment must be funded first');
        order.status = order_entity_1.OrderStatus.IN_PROGRESS;
        return this.ordersRepo.save(order);
    }
    async complete(orderId, clientId) {
        const order = await this.findById(orderId);
        if (order.client.id !== clientId)
            throw new common_1.ForbiddenException();
        if (order.status !== order_entity_1.OrderStatus.IN_PROGRESS)
            throw new common_1.BadRequestException('Order is not in progress');
        order.status = order_entity_1.OrderStatus.COMPLETED;
        order.completedAt = new Date();
        order.escrowStatus = order_entity_1.EscrowStatus.RELEASED;
        return this.ordersRepo.save(order);
    }
    async cancel(orderId, userId) {
        const order = await this.findById(orderId);
        const isClient = order.client.id === userId;
        const isArtisan = order.artisan.user.id === userId;
        if (!isClient && !isArtisan)
            throw new common_1.ForbiddenException();
        if ([order_entity_1.OrderStatus.COMPLETED, order_entity_1.OrderStatus.CANCELLED].includes(order.status)) {
            throw new common_1.BadRequestException('Order cannot be cancelled');
        }
        order.status = order_entity_1.OrderStatus.CANCELLED;
        if (order.escrowStatus === order_entity_1.EscrowStatus.FUNDED) {
            order.escrowStatus = order_entity_1.EscrowStatus.REFUNDED;
        }
        return this.ordersRepo.save(order);
    }
    async updateEscrow(orderId, amount, status, transactionId) {
        await this.ordersRepo.update(orderId, {
            escrowAmount: amount,
            escrowStatus: status,
            paymentTransactionId: transactionId,
        });
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.OrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(artisan_entity_1.ArtisanEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map