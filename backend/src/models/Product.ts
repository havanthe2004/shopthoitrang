import {
    Entity, PrimaryGeneratedColumn, Column,
    ManyToOne, OneToMany
} from "typeorm";
import { Category } from "./Category";
import { ProductVariant } from "./ProductVariant";

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    productId!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    slug!: string;

    @Column("text")
    description!: string;

    @Column({ default: 0 })
    sold!: number;

    @ManyToOne(() => Category, c => c.products)
    category!: Category;

    @OneToMany(() => ProductVariant, v => v.product)
    variants!: ProductVariant[];

    @Column({ default: true })
    isActive!: boolean;
}
