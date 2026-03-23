import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("website_configs")
export class WebsiteConfig {
  @PrimaryGeneratedColumn()
  websiteConfigId!: number;

  @Column()
  siteName!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column()
  address!: string;
}
