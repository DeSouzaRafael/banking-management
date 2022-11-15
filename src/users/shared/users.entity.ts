import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({name:'users'})
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 15 })
  govId: string;

  @Column('float')
  balance: GLfloat;

  @Column({ length: 255 })
  password: string;

  constructor(user?: Partial<UserEntity>) {
    this.id = user?.id;
    this.name = user?.name;
    this.govId = user?.govId;
    this.balance = user?.balance;
    this.password = user?.password;
  }
}