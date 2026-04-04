import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, OneToMany, CreateDateColumn
} from "typeorm";
import { User } from "./User";
import { OrderItem } from "./OrderItem";

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn()
    orderId!: number;

    @ManyToOne(() => User, u => u.orders)
    user!: User;

    @Column({
        type: "enum",
        enum: ["pending", "approved", "shipping", "completed", "cancelled", "returned"],
        default: "pending"
    })
    status!: string;

    @Column()
    receiverName!: string;

    @Column()
    phone!: string;

    @Column()
    address!: string;

    @Column("decimal")
    totalPrice!: number;

    @Column({
        type: "enum",
        enum: ["COD", "VNPAY", "MOMO", "BANK_TRANSFER"],
        default: "COD"
    })
    paymentMethod!: string; // Phương thức thanh toán

    @Column({
        type: "enum",
        enum: ["pending", "paid", "refunded", "failed"],
        default: "pending"
    })
    paymentStatus!: string; // Trạng thái thanh toán

    @Column({ type: "text", nullable: true })
    note!: string;

    @OneToMany(() => OrderItem, i => i.order)
    items!: OrderItem[];

    @CreateDateColumn()
    createdAt!: Date;
}
