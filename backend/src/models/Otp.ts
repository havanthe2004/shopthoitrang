import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("otps")
export class Otp {
    @PrimaryGeneratedColumn()
    optId!: number;

    @Column()
    email!: string;

    @Column()
    code!: string;

    @Column({ type: 'int', default: 0 })
    failedAttempts!: number;

    @Column()
    expiredAt!: Date;

    @Column({ default: false })
    isUsed!: boolean;

    @CreateDateColumn()
    createdAt!: Date;
}