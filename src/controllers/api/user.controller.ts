import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { User } from "src/entities/user.entity";
import { AllowToRoles } from "src/misc/allow.to.roles.descriptor";
import { RoleCheckerGuard } from "src/misc/role.checker.guard";
import { UserService } from "src/services/user/user.service";

@Controller('api/user/profile')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(':id')
    @UseGuards(RoleCheckerGuard)
    @AllowToRoles('user')
    getById(@Param('id') id: number): Promise<User> {
        return this.userService.getById(id);
    }
}