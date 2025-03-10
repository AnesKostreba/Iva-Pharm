import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Article } from "src/entities/article.entity";
import { CartArticle } from "src/entities/cart.article.entity";
import { Cart } from "src/entities/cart.entity";
import { Order } from "src/entities/order.entity";
import { Repository } from "typeorm";

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private readonly cart: Repository<Cart>,

        @InjectRepository(CartArticle)
        private readonly cartArticle: Repository<CartArticle>,
    ) { }

    async getLastActiveCartByUserId(userId: number): Promise<Cart | null> {
        const carts = await this.cart.find({ // spisak svih korpi
            where: {
                userId: userId // koje odgovaraju useru
            },
            order: {
                createdAt: "DESC" // sortirati po datumu, najnoviji na vrhu
            },
            take: 1, // od tih najnovijih uzeti samo jednu
            relations: ["order"], // i eventualno ako imaju ucitavamo order
        })

        if (!carts || carts.length === 0) {
            return null; // ne postoji korpa
        }
        // da li u trenutnoj korpi 
        const cart = carts[0];
        if (cart.order !== null) {
            return null;
        }

        return cart;

    }

    async createNewCartForUser(userId: number): Promise<Cart> { //kreiranje korpe kao nova instanca
        const newCart: Cart = new Cart()
        newCart.userId = userId;
        return await this.cart.save(newCart);

    }

    async addArticleToCart(cartId: number, articleId: number, quantity: number): Promise<Cart> { // dodavanje artikla u korpu
        let record: CartArticle = await this.cartArticle.findOne({
            // 
            where: {
                cartId: cartId,
                articleId: articleId
            }
        });
        // ako nije bilo record-a tad kreiramo taj record
        if (!record) {
            record = new CartArticle();
            record.cartId = cartId;
            record.articleId = articleId;
            record.quantity = quantity;

        } else { // ako je pronadjen record onda uzimam quantiti iz tog record-a
            record.quantity += quantity;
        }

        await this.cartArticle.save(record);

        return this.getById(cartId);
    }

    async getById(cartId: number): Promise<Cart> {
        return await this.cart.findOne({
            where: { cartId: cartId },
            relations: [
                "user",
                "cartArticles",
                "cartArticles.article",
                "cartArticles.article.category",
                "cartArticles.article.photos",
                "cartArticles.article.articlePrices",
            ],
        });
    }

    async changeQuantity(cartId: number, articleId: number, newQuantity: number): Promise<Cart> {
        let record: CartArticle = await this.cartArticle.findOne({
            where: {
                cartId: cartId,
                articleId: articleId
            }
        });

        if (record) { // ako jeste pronadjen record
            record.quantity = newQuantity;

            if (record.quantity === 0) {
                await this.cartArticle.delete(record.carArticleId);
            } else {
                await this.cartArticle.save(record);
            }
        }
        // ako se sve zavrsi vrati getById, i ako se nije nista od gore navedenog zavrsilo isto svakako vracamo nepromenjen getById cat
        return await this.getById(cartId);
    }
}