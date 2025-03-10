export class JwtRefreshDataDto{
    role: "administrator" | "user"
    id: number;
    identity: string;
    exp: number; // UNIX TIMESTAMP
    ip: string;
    ua: string; // USER AGENT

    toPlainObject(){
        return{
            role: this.role,
            id: this.id,
            identity: this.identity,
            exp : this.exp,
            ip : this.ip,
            ua : this.ua
        }
    }
}