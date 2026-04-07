import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, Unique
} from "typeorm";
import { Product } from "./Product";
import { ProductColor } from "./ProductColor";

@Entity("product_variants")
@Unique(["product", "color", "size"]) // tránh trùng variant
export class ProductVariant {
    @PrimaryGeneratedColumn()
    productVariantId!: number;

    @ManyToOne(() => Product, p => p.variants, { onDelete: "CASCADE" })
    product!: Product;

    // ✅ thay string color bằng relation
    @ManyToOne(() => ProductColor, c => c.variants, { onDelete: "CASCADE" })
    color!: ProductColor;

    @Column()
    size!: string;

    @Column("decimal", { precision: 12, scale: 2 })
    price!: number;

    @Column()
    stock!: number;
}