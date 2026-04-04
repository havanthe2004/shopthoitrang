import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity("addresses")
export class Address {
    @PrimaryGeneratedColumn()
    addressId!: number;

    @Column()
    receiverName!: string; // Tên người nhận

    @Column()
    phone!: string; // Số điện thoại nhận hàng

    @Column()
    province!: string; // Tỉnh/Thành phố

    @Column()
    district!: string; // Quận/Huyện

    @Column()
    ward!: string; // Phường/Xã

    @Column()
    detailAddress!: string; // Số nhà, tên đường

    @Column({ default: false })
    isDefault!: boolean; // Địa chỉ mặc định

    @ManyToOne(() => User, user => user.addresses, { onDelete: 'CASCADE' })
    user!: User;
}