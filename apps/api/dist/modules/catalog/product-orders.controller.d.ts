import { ProductOrdersService, CreateProductOrderDto } from './product-orders.service';
export declare class ProductOrdersController {
    private readonly service;
    constructor(service: ProductOrdersService);
    create(req: any, dto: CreateProductOrderDto): Promise<import("./entities/product-order.entity").ProductOrderEntity>;
    findMine(req: any): Promise<import("./entities/product-order.entity").ProductOrderEntity[]>;
    findShopOrders(req: any): Promise<import("./entities/product-order.entity").ProductOrderEntity[]>;
    getShopStats(req: any): Promise<{
        activeProducts: number;
        promotedProducts: number;
        toProcess: number;
        ready: number;
        totalRevenue: number;
    }>;
    findOne(id: string): Promise<import("./entities/product-order.entity").ProductOrderEntity>;
    triggerEscrow(id: string, req: any): Promise<import("./entities/product-order.entity").ProductOrderEntity>;
    markReady(id: string, req: any): Promise<import("./entities/product-order.entity").ProductOrderEntity>;
    markDelivered(id: string, req: any): Promise<import("./entities/product-order.entity").ProductOrderEntity>;
    cancel(id: string, req: any): Promise<import("./entities/product-order.entity").ProductOrderEntity>;
}
//# sourceMappingURL=product-orders.controller.d.ts.map