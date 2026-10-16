import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from "./User";

@Entity("conversations")
@Index(["updatedAt"])
export class Conversation {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.userId, { eager: true })
    user!: User;

    @Column({ type: "text", nullable: true })
    lastMessage!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
