import * as Validator from 'class-validator';
export class LoginUserDto {
    @Validator.IsNotEmpty()
    @Validator.IsEmail({
        allow_ip_domain: false,
        allow_utf8_local_part: true,
        require_tld: true
    })
    email: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(6,128)
    @Validator.Matches(/^(?=.*[a-z])[a-z]{6,}$/)
    // @Validator.Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!.\?])[a-zA-Z\d@!.\?]{6,}$/)
    password: string;
}