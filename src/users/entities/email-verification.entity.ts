import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { v4 as uuid4 } from 'uuid';
import { CoreEntity } from 'src/common/entities/core.enity';
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class EmailVerification extends CoreEntity {
  @Column()
  @Field(() => String)
  code: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @BeforeInsert()
  createCode(): void {
    // this.code = Math.random().toString(36).substring(2);
    this.code = uuid4();
  }
}