import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne
} from "typeorm";
import { ProductColor } from "./ProductColor";

@Entity("product_images")
export class ProductImage {
    @PrimaryGeneratedColumn()
    productImageId!: number;

    @Column()
    url!: string;

    // ✅ ảnh thuộc về màu
    @ManyToOne(() => ProductColor, c => c.images, { onDelete: "CASCADE" })
    color!: ProductColor;

    // optional
    @Column({ default: false })
    isThumbnail!: boolean;
}