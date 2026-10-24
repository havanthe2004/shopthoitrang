import {
    Entity, PrimaryColumn, Column,
    CreateDateColumn, UpdateDateColumn
} from "typeorm";

export interface OrderPayloadData {
    selectedIds: number[];
    receiverName: string;
    phone: string;
    address: string;
    totalPrice: number;
    note?: string;
}

@Entity("payment_transactions")
export class PaymentTransaction {
    @PrimaryColumn({ length: 64 })
    txnRef!: string;

    @Column()
    userId!: number;

    @Column("decimal", { precision: 12, scale: 2 })
    amount!: number;

    @Column({
        type: "enum",
        enum: ["pending", "success", "failed"],
        default: "pending"
    })
    status!: string;

    @Column({ type: "json" })
    orderPayload!: OrderPayloadData;

    @Column({ nullable: true })
    orderId?: number;

    @Column({ nullable: true, length: 10 })
    responseCode?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
