import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from "typeorm";
import { Conversation } from "./Conversation";

@Entity("messages")
@Index(["conversation", "createdAt"]) // Composite index for efficient pagination
export class Message {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Conversation, { onDelete: "CASCADE" })
    @JoinColumn({ name: "conversationId" })
    conversation!: Conversation;

    @Column({
        type: "enum",
        enum: ["user", "admin"]
    })
    senderType!: "user" | "admin";

    @Column()
    senderId!: number;

    @Column({ type: "text" })
    content!: string;

    @Column({
        type: "varchar",
        length: 20,
        default: "text"
    })
    messageType!: "text" | "product";

    @Column({ type: "json", nullable: true })
    productData?: {
        productId: number;
        name: string;
        price: number | string;
        image: string;
        slug: string;
    } | null;

    @Column({ default: false })
    isRead!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}
