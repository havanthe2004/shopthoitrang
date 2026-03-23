import {
    Entity, PrimaryGeneratedColumn, Column,
    OneToMany, OneToOne, CreateDateColumn
} from "typeorm";
import { Address } from "./Address";
import { Cart } from "./Cart";
import { Order } from "./Order";
import { RefreshToken } from "./RefreshToken";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    userId!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    phone!: string;

    @Column({ nullable: true })
    avatar!: string;

    @Column({ default: true })
    isActive!: boolean;

    @OneToMany(() => Address, a => a.user)
    addresses!: Address[];

    @OneToOne(() => Cart, c => c.user)
    cart!: Cart;

    @OneToMany(() => Order, o => o.user)
    orders!: Order[];

    @OneToMany(() => RefreshToken, rt => rt.user)
    refreshTokens!: RefreshToken[];

    @CreateDateColumn()
    createdAt!: Date;
}
