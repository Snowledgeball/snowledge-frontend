import { Gender } from "../enums/Gender";

export interface ISignUp {
	gender?: Gender;
	firstname: string;
	lastname: string;
	pseudo: string;
	email: string;
    age?: Date;
	password: string;	
	referrer?: string;
}

export type FormDataSignUp = ISignUp & { confirmPwd: string; }