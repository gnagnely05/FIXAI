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
const user_entity_1 = require("../users/entities/user.entity");
const artisan_entity_1 = require("../artisans/entities/artisan.entity");
let OrdersService = class OrdersService {
    constructor(ordersRepo, artisansRepo, usersRepo) {
        this.ordersRepo = ordersRepo;
        this.artisansRepo = artisansRepo;
        this.usersRepo = usersRepo;
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
    async findByArtisanUserId(userId) {
        return this.ordersRepo.find({
            where: { artisan: { user: { id: userId } } },
            relations: ['client'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByAgency(agencyUserId) {
        return this.ordersRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.client', 'client')
            .leftJoinAndSelect('order.artisan', 'artisan')
            .leftJoinAndSelect('artisan.user', 'artisanUser')
            .where('artisanUser.agencyId = :agencyUserId', { agencyUserId })
            .orderBy('order.createdAt', 'DESC')
            .getMany();
    }
    /**
     * Litiges dont l'agence/BTP est gestionnaire.
     * Si disputeHandlerId est null → visible uniquement dans l'interface admin.
     */
    async findDisputesByHandler(handlerUserId) {
        return this.ordersRepo.find({
            where: { disputeHandlerId: handlerUserId, status: order_entity_1.OrderStatus.DISPUTED },
            relations: ['client', 'artisan', 'artisan.user'],
            order: { updatedAt: 'DESC' },
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
    /**
     * Règle 3 : seuls ARTISAN et ENTREPRISE_BTP peuvent confirmer.
     * AGENCE_HOTE est explicitement bloquée.
     */
    async confirm(orderId, requesterUserId, requesterRole) {
        if (requesterRole === 'AGENCE_HOTE') {
            throw new common_1.ForbiddenException('Les agences hôtes ne peuvent pas confirmer directement une commande. Assignez un artisan pour que celui-ci confirme.');
        }
        const order = await this.findById(orderId);
        const isArtisan = order.artisan?.user?.id === requesterUserId;
        const isEntrepriseBtp = requesterRole === 'ENTREPRISE_BTP' && order.artisan?.user?.agencyId === requesterUserId;
        if (!isArtisan && !isEntrepriseBtp)
            throw new common_1.ForbiddenException();
        if (order.status !== order_entity_1.OrderStatus.PENDING)
            throw new common_1.BadRequestException('Order cannot be confirmed');
        order.status = order_entity_1.OrderStatus.CONFIRMED;
        return this.ordersRepo.save(order);
    }
    /**
     * Règle 3 : AGENCE_HOTE assigne un artisan mais garde le statut PENDING
     * (l'artisan doit lui-même confirmer).
     * ENTREPRISE_BTP assigne ET confirme directement.
     */
    async assignArtisan(orderId, artisanId, requesterUserId, requesterRole) {
        const order = await this.findById(orderId);
        if (order.status !== order_entity_1.OrderStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending orders can be assigned');
        }
        const artisan = await this.artisansRepo.findOne({
            where: { id: artisanId },
            relations: ['user'],
        });
        if (!artisan)
            throw new common_1.NotFoundException('Artisan not found');
        // Vérifier que l'artisan appartient à l'agence/BTP requérante
        if (artisan.user?.agencyId !== requesterUserId) {
            throw new common_1.ForbiddenException('Cet artisan n\'est pas affilié à votre organisation');
        }
        order.artisan = artisan;
        if (requesterRole === 'ENTREPRISE_BTP') {
            // BTP a le pouvoir de confirmation directe
            order.status = order_entity_1.OrderStatus.CONFIRMED;
        }
        // AGENCE_HOTE : statut reste PENDING, l'artisan doit confirmer
        return this.ordersRepo.save(order);
    }
    async updateStatus(orderId, status, userId) {
        const order = await this.findById(orderId);
        const isArtisan = order.artisan?.user?.id === userId;
        if (!isArtisan)
            throw new common_1.ForbiddenException();
        const validTransitions = {
            CONFIRMED: order_entity_1.OrderStatus.CONFIRMED,
            IN_PROGRESS: order_entity_1.OrderStatus.IN_PROGRESS,
            COMPLETED: order_entity_1.OrderStatus.COMPLETED,
        };
        const newStatus = validTransitions[status];
        if (!newStatus)
            throw new common_1.BadRequestException('Invalid status');
        order.status = newStatus;
        if (newStatus === order_entity_1.OrderStatus.COMPLETED)
            order.completedAt = new Date();
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
        const isArtisan = order.artisan?.user?.id === userId;
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
    /**
     * Règle 2 : passage en DISPUTED → auto-assignation du gestionnaire.
     * Priority : agencyId de l'artisan → sinon null (géré par admin fixAI).
     */
    async openDispute(orderId, requesterId, reason) {
        const order = await this.findById(orderId);
        const isClient = order.client.id === requesterId;
        const isArtisan = order.artisan?.user?.id === requesterId;
        if (!isClient && !isArtisan)
            throw new common_1.ForbiddenException();
        if ([order_entity_1.OrderStatus.COMPLETED, order_entity_1.OrderStatus.CANCELLED, order_entity_1.OrderStatus.DISPUTED].includes(order.status)) {
            throw new common_1.BadRequestException('Ce statut ne permet pas d\'ouvrir un litige');
        }
        order.status = order_entity_1.OrderStatus.DISPUTED;
        order.escrowStatus = order_entity_1.EscrowStatus.DISPUTED;
        order.disputeReason = reason ?? undefined;
        // Auto-assignation au gestionnaire (agence/BTP de l'artisan)
        const artisanUser = await this.usersRepo.findOne({ where: { id: order.artisan?.user?.id } });
        order.disputeHandlerId = artisanUser?.agencyId ?? undefined; // undefined = admin fixAI
        return this.ordersRepo.save(order);
    }
    /**
     * Résolution d'un litige par l'agence/BTP ou l'admin.
     * outcome : 'CLIENT' (remboursement) | 'ARTISAN' (libération escrow)
     */
    async resolveDispute(orderId, resolverId, resolverRole, outcome, resolution) {
        const order = await this.findById(orderId);
        if (order.status !== order_entity_1.OrderStatus.DISPUTED)
            throw new common_1.BadRequestException('Order is not disputed');
        const isAdmin = resolverRole === 'ADMIN';
        const isHandler = order.disputeHandlerId === resolverId;
        if (!isAdmin && !isHandler)
            throw new common_1.ForbiddenException('Vous n\'êtes pas gestionnaire de ce litige');
        order.disputeResolution = resolution;
        order.status = order_entity_1.OrderStatus.COMPLETED;
        order.escrowStatus = outcome === 'ARTISAN' ? order_entity_1.EscrowStatus.RELEASED : order_entity_1.EscrowStatus.REFUNDED;
        order.completedAt = new Date();
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
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map