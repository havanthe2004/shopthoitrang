import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("posts")
export class Post {
  @PrimaryGeneratedColumn()
  postId!: number;

  @Column()
  title!: string;

  @Column("text")
  content!: string;

  @Column({ nullable: true }) 
  image!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
