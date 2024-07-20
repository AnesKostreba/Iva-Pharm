import { SetMetadata } from "@nestjs/common"

export const AllowToRoles = (...roles: ("administrator" | "user" | "visitor")[])=>{
    return SetMetadata('allow_to_roles', roles)
};