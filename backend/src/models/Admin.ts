import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { AdminRefreshToken } from "./AdminRefreshToken";

@Entity("admins")
export class Admin {
    @PrimaryGeneratedColumn()
    adminId!: number;

    @Column({ unique: true })
    username!: string;

    @Column()
    password!: string;


    @Column({
        type: "enum",
        enum: ["staff", "manager", "admin"],
        default: "staff"
    })
    role!: string;

    @Column({ nullable: true })
    phone!: string;

    @Column({ nullable: true })
    avatar!: string;

    @OneToMany(() => AdminRefreshToken, rt => rt.admin)
    refreshTokens!: AdminRefreshToken[];

    @Column({ default: true })
    isActive!: boolean;
}
