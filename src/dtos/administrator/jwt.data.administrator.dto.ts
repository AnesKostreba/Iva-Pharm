export class JwtDataAdministratorDto{
    administratorId: number;
    username: string;
    exp: number; // UNIX TIMESTAMP
    ip: string;
    ua: string // USER AGENT

    toPlainObject(){
        return{
            administratorId: this.administratorId,
            username: this.username,
            exp : this.exp,
            ip : this.ip,
            ua : this.ua
        }
    }
}