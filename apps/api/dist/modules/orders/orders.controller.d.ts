import { OrdersService, CreateOrderData } from './orders.service';
import { UserEntity } from '../users/entities/user.entity';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(req: {
        user: UserEntity & {
            sub: string;
        };
    }, body: CreateOrderData): Promise<import("./entities/order.entity").OrderEntity>;
    getMyOrders(req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/order.entity").OrderEntity[]>;
    findOne(id: string): Promise<import("./entities/order.entity").OrderEntity>;
    confirm(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/order.entity").OrderEntity>;
    complete(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/order.entity").OrderEntity>;
    cancel(id: string, req: {
        user: {
            sub: string;
        };
    }): Promise<import("./entities/order.entity").OrderEntity>;
}
//# sourceMappingURL=orders.controller.d.ts.map