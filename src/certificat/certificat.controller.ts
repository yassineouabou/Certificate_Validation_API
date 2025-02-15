import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseGuards } from '@nestjs/common';
import { CertificatService } from './certificat.service';
import { CreateCertificatDto } from './dto/create-certificat.dto';
import { UpdateCertificatDto } from './dto/update-certificat.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RolesGuard } from 'src/roles/roles.guard';
import { UtilisateurRole } from 'src/enums/utilisateur-role.enum';
import { Roles } from 'src/roles.decorator';




@Controller('certificat')
export class CertificatController {
  constructor(private readonly certificatService: CertificatService) {}





  @UseGuards(AuthGuard,RolesGuard)
  @Roles(UtilisateurRole.INSTITUTION)
  @Post()
  async create(@Body(ValidationPipe) createCertificatDto: CreateCertificatDto) {
    return await this.certificatService.create(createCertificatDto);
  }


  @UseGuards(AuthGuard,RolesGuard)
  @Roles(UtilisateurRole.INSTITUTION)
  
  @Get()
  findAll() {
    return this.certificatService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.certificatService.findOne(id);
  }


  @UseGuards(AuthGuard,RolesGuard)
  @Roles(UtilisateurRole.INSTITUTION)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCertificatDto: UpdateCertificatDto) {
    return this.certificatService.update(id, updateCertificatDto);
  }



  @UseGuards(AuthGuard,RolesGuard)
  @Roles(UtilisateurRole.INSTITUTION)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.certificatService.remove(id);
  }
}
