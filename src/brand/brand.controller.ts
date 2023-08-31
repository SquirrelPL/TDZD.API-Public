import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { BrandService } from './brand.service';
import { GetUser, Permission } from 'src/auth/decorator';
import { UserEntity } from 'src/auth/dto/user.dto';
import { CreateBrandDto } from './dto';
import { JwtGuard, RolesGuard } from 'src/auth/guard';

//
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get('/ById/:id')
  getBrandPublic(@Param('id', ParseIntPipe) id: number){
      return this.brandService.getBrandPublic(id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Permission(false, 'brand.seeBrands')
  @Get()
  getBrands(@GetUser() user: UserEntity){
      return this.brandService.getBrands(user);
  }

  @Get('/public')
  getPublicBrands(){
      return this.brandService.getPublicBrands();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Permission(false, 'brand.updateBrand')
  @Patch('/updateBrand/:id')
  updateBrand(@GetUser() user: UserEntity, @Body() dto: CreateBrandDto, @Param('id', ParseIntPipe) id: number){
      return this.brandService.updateBrand(user, dto, id);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Permission(false, 'Squirrels.SuperPermission')
  @Patch('/assignOwner/:serverId/:id')
  assignOwner(@GetUser() user: UserEntity, @Param('id', ParseIntPipe) userId: number, @Param('serverId', ParseIntPipe) serverId: number){
      return this.brandService.assignOwner(user, userId, serverId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Permission(false, 'Squirrels.SuperPermission')
  @Patch('/unassignOwner/:serverId/:id')
  unassignOwner(@GetUser() user: UserEntity, @Param('id', ParseIntPipe) userId: number, @Param('serverId', ParseIntPipe) serverId: number){
      return this.brandService.unassignOwner(user, userId, serverId);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Permission(false, 'Squirrels.SuperPermission')
  @Post()
  createBrand(@GetUser() user: UserEntity, @Body() dto: CreateBrandDto){
      return this.brandService.createBrand(user, dto);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Permission(false, 'Squirrels.SuperPermission')
  @Delete('/:id')
  deleteBrand(@GetUser() user: UserEntity, @Param('id', ParseIntPipe) id: number){
      return this.brandService.deleteBrand(user, id);
  }
}


