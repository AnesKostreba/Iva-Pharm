import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Cart } from "src/entities/cart.entity";
import { Order } from "src/entities/order.entity";
import { User } from "src/entities/user.entity";
import { ApiResponse } from "src/misc/api.response.class";
import { Repository } from "typeorm";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Cart)
        private readonly cart: Repository<Cart>,

        @InjectRepository(Order)
        private readonly order: Repository<Order>,
    ) { }

    async add(cartId: number):Promise<Order | ApiResponse>{
        const order = await this.order.findOne({
            where:{cartId : cartId}
        });
        // da li order postoji
        if(order){
            return new ApiResponse("error", -7001, 'An order for this cart has already been made!')
        }

        // da li cart postoji
        const cart = await this.cart.findOne({
            where:{cartId: cartId},
            // da li korpa ima bar jedan article u sebi, moram dodati relaciju da bi je dalje koristio
            relations: [
                "cartArticles"
            ]
        });

        if(!cart){
            return new ApiResponse("error", -7002, 'No such cart found!')
        }

        // da li korpa ima bar jedan article u sebi
        if(cart.cartArticles.length === 0){
            return new ApiResponse("error", -7003, 'This cart is empty!')
        }

        const newOrder: Order = new Order();
        newOrder.cartId = cartId;


        const savedOrder = await this.order.save(newOrder);

        cart.createdAt = new Date();
        await this.cart.save(cart)

        return await this.getById(savedOrder.orderId);
    }

    async getById(orderId: number){
        return await this.order.findOne({where:{orderId},
            relations:[
                "cart",
                "cart.user",
                "cart.cartArticles",
                "cart.cartArticles.article",
                "cart.cartArticles.article.category",
                "cart.cartArticles.article.articlePrices",
            ]
        })
    }

    async getAllByUserId(userId: number): Promise<Order[]> {
        const orders = await this.order
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.cart', 'cart')
            .leftJoinAndSelect('cart.user', 'user')
            .leftJoinAndSelect('cart.cartArticles', 'cartArticles')
            .leftJoinAndSelect('cartArticles.article', 'article')
            .leftJoinAndSelect('article.category', 'category')
            .leftJoinAndSelect('article.articlePrices', 'articlePrices')
            .where('cart.userId = :userId', { userId })
            .orderBy('order.createdAt', 'DESC')
            .getMany();

        return orders;
    }

        // return await this.order.find({
        //     where: {
        //         cart: {
        //             userId: userId
        //         }
        //     },
        //     relations:[
        //         "cart",
        //         "cart.user",
        //         "cart.cartArticles",
        //         "cart.cartArticles.article",
        //         "cart.cartArticles.article.category",
        //         "cart.cartArticles.article.articlePrices",
        //     ]
        // })
    // }

    async getAll():Promise<Order[]>{
        const orders = await this.order.createQueryBuilder('order')
        .leftJoinAndSelect('order.cart','cart')
        .leftJoinAndSelect('cart.user','user')
        .leftJoinAndSelect('cart.cartArticles','cartArticles')
        .leftJoinAndSelect('cartArticles.article','article')
        .leftJoinAndSelect('article.category','category')
        .leftJoinAndSelect('article.articlePrices','articlePrices')
        .orderBy('order.createdAt', 'DESC')
        .getMany()

        return orders;
        // return await this.order.find({
        //     relations:[
        //         "cart",
        //         "cart.user",
        //         "cart.cartArticles",
        //         "cart.cartArticles.article",
        //         "cart.cartArticles.article.category",
        //         "cart.cartArticles.article.articlePrices",
        //     ]
        // })
    }


    async changeStatus(orderId: number, newStatus: "rejected" | "accepted" | "shipped" | "pending"){
        const order = await this.getById(orderId);

        if(!order){
            return new ApiResponse('error', -9002, 'No such order found!')
        }

        order.status = newStatus;

        await this.order.save(order);

        return await this.getById(orderId);
    }
}