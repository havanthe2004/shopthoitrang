import { Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { CartItem } from "./CartItem";

@Entity("carts")
export class Cart {
    @PrimaryGeneratedColumn()
    cartId!: number;

    @OneToOne(() => User, u => u.cart)
    @JoinColumn()
    user!: User;

    @OneToMany(() => CartItem, i => i.cart)
    items!: CartItem[];
}
