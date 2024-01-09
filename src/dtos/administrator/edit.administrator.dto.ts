import * as Validator from 'class-validator'
export class EditAdministratorDto{
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!.\?])[a-zA-Z\d@!.\?]{6,}$/)
    password: string;
}