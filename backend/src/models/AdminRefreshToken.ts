import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Admin } from "./Admin";

@Entity("admin_refresh_tokens")
export class AdminRefreshToken {
  @PrimaryGeneratedColumn()
  adminRefreshTokenId!: number;

  @Column("text")
  token!: string;

  @Column()
  expiredAt!: Date;

  @ManyToOne(() => Admin, a => a.refreshTokens, { onDelete: "CASCADE" })
  admin!: Admin;

  @CreateDateColumn()
  createdAt!: Date;
}
