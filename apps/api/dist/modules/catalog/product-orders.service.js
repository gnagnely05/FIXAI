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
exports.ProductOrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_order_entity_1 = require("./entities/product-order.entity");
const product_entity_1 = require("./entities/product.entity");
const user_entity_1 = require("../users/entities/user.entity");
const commission_config_entity_1 = require("../admin/entities/commission-config.entity");
let ProductOrdersService = class ProductOrdersService {
    constructor(poRepo, productRepo, userRepo, commissionRepo) {
        this.poRepo = poRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.commissionRepo = commissionRepo;
    }
    async getCommissionRate() {
        const config = await this.commissionRepo.findOne({ where: { isActive: true } });
        return config?.storeCommissionRate ?? 0.05;
    }
    /**
     * Règle 1 : une commande doit être liée à un service OU à un devis pro validé.
     */
    async create(client, dto) {
        if (!dto.linkedServiceOrderId && !dto.linkedDevisProId) {
            throw new common_1.BadRequestException('Une commande de matériel doit être liée à une prestation ou à un devis pro validé.');
        }
        // Résoudre les produits
        const resolvedItems = [];
        let totalAmountXof = 0;
        let merchantName = '';
        let merchantType = null;
        for (const lineItem of dto.items) {
            const product = await this.productRepo.findOne({ where: { id: lineItem.productId, merchantId: dto.merchantId } });
            if (!product)
                throw new common_1.NotFoundException(`Produit ${lineItem.productId} introuvable dans ce magasin`);
            if (!product.isAvailable)
                throw new common_1.BadRequestException(`Produit "${product.name}" non disponible`);
            if (product.stock > 0 && lineItem.qty > product.stock) {
                throw new common_1.BadRequestException(`Stock insuffisant pour "${product.name}" (stock: ${product.stock})`);
            }
            const subtotal = Number(product.priceXof) * lineItem.qty;
            resolvedItems.push({
                productId: product.id,
                name: product.name,
                unit: product.unit ?? undefined,
                qty: lineItem.qty,
                unitPriceXof: Number(product.priceXof),
                subtotalXof: subtotal,
            });
            totalAmountXof += subtotal;
            merchantName = product.merchantName;
            merchantType = product.merchantType;
        }
        if (resolvedItems.length === 0)
            throw new common_1.BadRequestException('Aucun produit valide dans la commande');
        const commissionRate = await this.getCommissionRate();
        const commissionAmountXof = Math.round(totalAmountXof * commissionRate);
        const netAmountXof = totalAmountXof - commissionAmountXof;
        // Règle 2 : vérifier si le wallet client est suffisant
        const walletBalance = Number(client.walletBalance ?? 0);
        const initialStatus = walletBalance >= totalAmountXof
            ? product_order_entity_1.ProductOrderStatus.PENDING_ARTISAN
            : product_order_entity_1.ProductOrderStatus.PENDING_PROVISIONING;
        const order = this.poRepo.create({
            client,
            merchantId: dto.merchantId,
            merchantName,
            merchantType,
            items: resolvedItems,
            totalAmountXof,
            commissionAmountXof,
            netAmountXof,
            status: initialStatus,
            linkedServiceOrderId: dto.linkedServiceOrderId,
            linkedDevisProId: dto.linkedDevisProId,
            notes: dto.notes,
            escrowLocked: false,
        });
        return this.poRepo.save(order);
    }
    /**
     * Règle 2 : déclenché quand wallet est plein ET artisan/devis validé.
     * Bloque les fonds en escrow et passe en PROCESSING (commande envoyée à la boutique).
     */
    async triggerEscrowAndProcess(orderId, requesterUserId) {
        const order = await this.findById(orderId);
        if (order.client.id !== requesterUserId)
            throw new common_1.ForbiddenException();
        if (order.escrowLocked)
            throw new common_1.BadRequestException('Escrow déjà bloqué');
        if (![product_order_entity_1.ProductOrderStatus.PENDING_PROVISIONING, product_order_entity_1.ProductOrderStatus.PENDING_ARTISAN].includes(order.status)) {
            throw new common_1.BadRequestException('Statut incompatible avec le déclenchement de l\'escrow');
        }
        // Vérifier wallet client
        const client = await this.userRepo.findOne({ where: { id: requesterUserId } });
        if (Number(client.walletBalance) < order.totalAmountXof) {
            throw new common_1.BadRequestException('Portefeuille insuffisant — provisionnez avant de passer commande');
        }
        // Débiter le wallet client et bloquer en escrow
        await this.userRepo.update(requesterUserId, {
            walletBalance: Number(client.walletBalance) - order.totalAmountXof,
        });
        order.escrowLocked = true;
        order.status = product_order_entity_1.ProductOrderStatus.PROCESSING;
        return this.poRepo.save(order);
    }
    /** Boutique marque la commande comme prête */
    async markReady(orderId, merchantUserId) {
        const order = await this.findById(orderId);
        if (order.merchantId !== merchantUserId)
            throw new common_1.ForbiddenException();
        if (order.status !== product_order_entity_1.ProductOrderStatus.PROCESSING)
            throw new common_1.BadRequestException('Commande non en cours de traitement');
        order.status = product_order_entity_1.ProductOrderStatus.READY;
        return this.poRepo.save(order);
    }
    /** Client ou boutique confirme la livraison — libère l'escrow */
    async markDelivered(orderId, requesterUserId) {
        const order = await this.findById(orderId);
        const isClient = order.client.id === requesterUserId;
        const isMerchant = order.merchantId === requesterUserId;
        if (!isClient && !isMerchant)
            throw new common_1.ForbiddenException();
        if (order.status !== product_order_entity_1.ProductOrderStatus.READY)
            throw new common_1.BadRequestException('Commande non prête');
        // Libérer le net vers le marchand
        const merchant = await this.userRepo.findOne({ where: { id: order.merchantId } });
        if (merchant) {
            await this.userRepo.update(order.merchantId, {
                walletBalance: (Number(merchant.walletBalance) + order.netAmountXof),
            });
        }
        order.status = product_order_entity_1.ProductOrderStatus.DELIVERED;
        order.deliveredAt = new Date();
        return this.poRepo.save(order);
    }
    async cancelOrder(orderId, requesterUserId) {
        const order = await this.findById(orderId);
        if (order.client.id !== requesterUserId)
            throw new common_1.ForbiddenException();
        if ([product_order_entity_1.ProductOrderStatus.DELIVERED, product_order_entity_1.ProductOrderStatus.CANCELLED].includes(order.status)) {
            throw new common_1.BadRequestException('Impossible d\'annuler');
        }
        // Rembourser si escrow bloqué
        if (order.escrowLocked) {
            const client = await this.userRepo.findOne({ where: { id: requesterUserId } });
            await this.userRepo.update(requesterUserId, {
                walletBalance: (Number(client.walletBalance) + order.totalAmountXof),
            });
            order.escrowLocked = false;
        }
        order.status = product_order_entity_1.ProductOrderStatus.CANCELLED;
        return this.poRepo.save(order);
    }
    async findByClient(clientId) {
        return this.poRepo.find({
            where: { client: { id: clientId } },
            relations: ['client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByMerchant(merchantId) {
        return this.poRepo.find({
            where: { merchantId },
            relations: ['client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        const order = await this.poRepo.findOne({ where: { id }, relations: ['client'] });
        if (!order)
            throw new common_1.NotFoundException('Commande produit introuvable');
        return order;
    }
    /** Stats pour le dashboard marchant */
    async getMerchantStats(merchantId) {
        const orders = await this.findByMerchant(merchantId);
        const products = await this.productRepo.find({ where: { merchantId } });
        const activeProducts = products.filter(p => p.isAvailable).length;
        const promotedProducts = products.filter(p => p.isPromoted).length;
        const toProcess = orders.filter(o => o.status === product_order_entity_1.ProductOrderStatus.PROCESSING).length;
        const ready = orders.filter(o => o.status === product_order_entity_1.ProductOrderStatus.READY).length;
        const totalRevenue = orders
            .filter(o => o.status === product_order_entity_1.ProductOrderStatus.DELIVERED)
            .reduce((s, o) => s + Number(o.netAmountXof), 0);
        return { activeProducts, promotedProducts, toProcess, ready, totalRevenue };
    }
};
exports.ProductOrdersService = ProductOrdersService;
exports.ProductOrdersService = ProductOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_order_entity_1.ProductOrderEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(commission_config_entity_1.CommissionConfigEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProductOrdersService);
//# sourceMappingURL=product-orders.service.js.map