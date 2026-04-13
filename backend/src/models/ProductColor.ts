import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, OneToMany, Unique
} from "typeorm";
import { Product } from "./Product";
import { ProductVariant } from "./ProductVariant";
import { ProductImage } from "./ProductImage";

@Entity("product_colors")
@Unique(["product", "color"]) // tránh trùng màu
export class ProductColor {
    @PrimaryGeneratedColumn()
    productColorId!: number;

    @Column()
    color!: string; // ví dụ: "Đen", "Trắng"

    @Column({ nullable: true })
    hexCode!: string; // ví dụ: #000000 (optional)

    @Column({ default: true })
    isActive!: boolean;

    @ManyToOne(() => Product, p => p.colors, { onDelete: "CASCADE" })
    product!: Product;

    @OneToMany(() => ProductVariant, v => v.color)
    variants!: ProductVariant[];

    @OneToMany(() => ProductImage, i => i.color)
    images!: ProductImage[];
}