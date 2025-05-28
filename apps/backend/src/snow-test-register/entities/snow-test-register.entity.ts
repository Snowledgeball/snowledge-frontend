import { Email } from "src/email/entities/email.entity";
import { PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";

export class SnowTestRegister {
        @PrimaryGeneratedColumn()
        id: number;
    
        @Column({ nullable: true, unique: true })
        email: string;
    
        @Column()
        firstname: string;
    
        @Column()
        lastname: string;
    
        @Column()
        expertise: string;

        @Column()
        communitySize: number;

        @Column()
        platforms: string[];

        @Column({ nullable: true })
        referrer: string;
    
        @Column({ unique: true })
        referral: string;
    
        @OneToMany(() => Email, (email) => email.user)
        emails: Email[];
        
        @Column({ nullable: true })
        refreshToken: string;
    
        @CreateDateColumn({
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP(6)',
        })
        created_at: Date;
    
        @UpdateDateColumn({
            type: 'timestamp',
            default: () => 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
        })
        updated_at: Date;
}
