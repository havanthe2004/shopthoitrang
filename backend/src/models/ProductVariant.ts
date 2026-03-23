import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Product } from "./Product";
import { ProductImage } from "./ProductImage";

@Entity("product_variants")
export class ProductVariant {
    @PrimaryGeneratedColumn()
    productVariantId!: number;

    @Column()
    color!: string;

    @Column()
    size!: string;

    @Column("decimal", { precision: 12, scale: 2 })
    price!: number; 

    @Column()
    stock!: number; 

    @ManyToOne(() => Product, p => p.variants, { onDelete: 'CASCADE' })
    product!: Product;

    @OneToMany(() => ProductImage, i => i.variant)
    images!: ProductImage[];
}