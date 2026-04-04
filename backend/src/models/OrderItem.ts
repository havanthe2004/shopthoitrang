import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./Order";
import { ProductVariant } from "./ProductVariant";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  orderItemId!: number;

  @ManyToOne(() => Order, o => o.items)
  order!: Order;

  @ManyToOne(() => ProductVariant)
  variant!: ProductVariant;

  @Column()
  quantity!: number;

  @Column("decimal")
  price!: number;
}
