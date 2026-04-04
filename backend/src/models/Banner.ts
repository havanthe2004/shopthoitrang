import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("banners")
export class Banner {
  @PrimaryGeneratedColumn()
  bannerId!: number;

  @Column()
  imageUrl!: string;

  @Column()
  link!: string;

  @Column({ default: true })
  isActive!: boolean;
}
