import * as Validator from 'class-validator'

export class AddAdministratorDto{
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(5,30)
    username: string;
    
    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(6,128)
    // @Validator.Matches(/^(?=.*[a-z])[a-z]{6,}$/)
    // @Validator.Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!.\?])[a-zA-Z\d@!.\?]{6,}$/)
    password: string;
}