import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { ProductVariant } from "./ProductVariant";

@Entity("product_images")
export class ProductImage {
    @PrimaryGeneratedColumn()
    productImageId!: number;

    @Column()
    url!: string;

    @ManyToOne(() => ProductVariant, v => v.images, { onDelete: 'CASCADE' })
    variant!: ProductVariant;
}