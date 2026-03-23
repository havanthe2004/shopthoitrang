import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Admin } from "./Admin";

@Entity("admin_logs")
export class AdminLog {
  @PrimaryGeneratedColumn()
  adminLogId!: number;

  @ManyToOne(() => Admin)
  admin!: Admin;

  @Column()
  action!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
