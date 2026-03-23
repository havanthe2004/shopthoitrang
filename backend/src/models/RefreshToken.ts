import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn()
  refreshTokenId!: number;

  @Column("text")
  token!: string;

  @Column()
  expiredAt!: Date;

  @ManyToOne(() => User, u => u.refreshTokens, { onDelete: "CASCADE" })
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}
