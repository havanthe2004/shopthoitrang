import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { Product } from "./Product";

@Entity("categories")
export class Category {
    @PrimaryGeneratedColumn()
    categoryId!: number;

    @Column()
    name!: string;

    @Column({ unique: true })
    slug!: string;

    @Column({ default: 0 })
    sortOrder!: number

    @Column()
    description!: string;

    @Column({ nullable: true })
    image!: string;

    @Column({ default: true })
    isActive!: boolean;

    @ManyToOne(() => Category, c => c.children, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: "parentId" })
    parent!: Category | null;

    @OneToMany(() => Category, c => c.parent)
    children!: Category[];

    @OneToMany(() => Product, p => p.category)
    products!: Product[];
}
