import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Cart } from "./Cart";
import { ProductVariant } from "./ProductVariant";

@Entity("cart_items")
export class CartItem {
  @PrimaryGeneratedColumn()
  cartItemId!: number;

  @ManyToOne(() => Cart, c => c.items, { onDelete: "CASCADE" })
  cart!: Cart;

  @ManyToOne(() => ProductVariant)
  variant!: ProductVariant;

  @Column() 
  quantity!: number;
}
