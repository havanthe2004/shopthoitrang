import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("vouchers")
export class Voucher {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  code!: string;

  @Column("decimal")
  discount!: number;

  @Column()
  expiredAt!: Date;
}
