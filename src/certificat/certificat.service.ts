import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCertificatDto } from './dto/create-certificat.dto';
import { UpdateCertificatDto } from './dto/update-certificat.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificat } from './entities/certificat.entity';
import { Repository } from 'typeorm';
import { PorteurService } from 'src/porteur/porteur.service';
import { InstitutionService } from 'src/institution/institution.service';
import * as QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class CertificatService {


  constructor(
    private porteurService : PorteurService,
    private instService: InstitutionService,

    @InjectRepository(Certificat) private readonly certeficatRepository: Repository<Certificat>

  ){}
  async create(createCertificatDto: CreateCertificatDto): Promise<Certificat> {
    const certeficat = this.certeficatRepository.create(createCertificatDto);
    const porteur = await this.porteurService.findPorteur(createCertificatDto.CIN)
    const institution = await this.instService.findOne(createCertificatDto.institutionId)
    certeficat.id = uuidv4();
    certeficat.porteur = porteur;
    certeficat.institution = institution;
    certeficat.imageSVG = await this.generateImageCertificate(certeficat);
    return this.certeficatRepository.save(certeficat);
  }

  async findAll() : Promise<Certificat[]> {
    return await this.certeficatRepository.find({
      relations: ["porteur","institution"]
    });
  }

  async findOne(id: string): Promise<Certificat> {
    const certeficat = await this.certeficatRepository.findOne({
      where: {id},
      relations: ['porteur', 'institution'],
    });
    if (!certeficat)
       throw new NotFoundException("Certificat Not Found")
    return certeficat;
  }

  async update(id: string, updateCertificatDto: UpdateCertificatDto): Promise<Certificat> {
    const result = await this.certeficatRepository.update(id, updateCertificatDto)
    if (result.affected == 0)
      throw new NotFoundException("Certificat Not Found");
    return this.certeficatRepository.findOne({
      where: {id},
      relations: ['porteur', 'institution'],
    });
  }

  async remove(id: string) : Promise<{ message: string }> {
    const certeficat = await this.findOne(id);
    if (!certeficat)
      throw new NotFoundException("there no certeficat with the provided ID")
    await this.certeficatRepository.delete(id)
    return {message: `the certeficat has been deleted successfully`}
  }


  async generateImageCertificate(certificate: Certificat): Promise<string> {
    const qrCodeImage = await QRCode.toDataURL(`https://9929-41-140-60-37.ngrok-free.app/${certificate.id}`);
    const canvasWidth = 1200;
    const canvasHeight = 850;
    
    // Create an SVG canvas
    const canvas = createCanvas(canvasWidth, canvasHeight, 'svg');
    const ctx = canvas.getContext('2d');
    
    // Fond avec une légère couleur (light background)
    ctx.fillStyle = '#f9f9f9';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Bordures colorées
    ctx.strokeStyle = '#0056b3'; // Blue color
    ctx.lineWidth = 15;
    ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100);
    
    // Ligne décorative au sommet
    ctx.fillStyle = '#0056b3';
    ctx.fillRect(50, 50, canvasWidth - 100, 15);
    
    // Titre principal
    ctx.fillStyle = '#333333';
    ctx.font = '700 48px "Times New Roman", serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Achievement', canvasWidth / 2, 150);
    
    // Texte secondaire
    ctx.font = 'italic 24px "Georgia", serif';
    ctx.fillText('This is to certify that', canvasWidth / 2, 270);
    
    // Nom de l'utilisateur
    ctx.fillStyle = '#0056b3'; // Blue name
    ctx.font = 'bold 40px "Arial Black", sans-serif';
    ctx.fillText(certificate.porteur.name, canvasWidth / 2, 320);
    
    // Texte de description
    ctx.font = '20px "Verdana", sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText('has successfully completed the course', canvasWidth / 2, 380);
  
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 28px "Trebuchet MS", sans-serif';
    ctx.fillText(certificate.nom, canvasWidth / 2, 440);
    
    // Texte sur la plateforme
    ctx.font = '20px "Verdana", sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(
      `offered by ${certificate.institution.name} in collaboration with Stanford University`,
      canvasWidth / 2,
      500
    );
    
    // Date d'émission
    ctx.font = 'italic 18px "Courier New", monospace';
    ctx.fillStyle = '#666666';
    ctx.fillText(`Issued on:${certificate.dateEmission} `, canvasWidth / 2, 550);
    
    // Lignes pour signatures
    ctx.beginPath();
    ctx.moveTo(140, 710);
    ctx.lineTo(400, 710);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Ajout du QR code
    const qrCode = await loadImage(qrCodeImage); // Load the QR code image
    ctx.drawImage(qrCode, canvasWidth - 240, canvasHeight - 250, 150, 150); // Adjust position
    
    // Ajout du logo (optionnel)
    const logo = await loadImage('./badge.png'); // Load the logo
    ctx.drawImage(logo, 80, 90, 130, 100); // Adjust position and size if needed
    
    // Save the SVG file
    const svgContent = canvas.toBuffer().toString(); // No need for a string format, just call toBuffer()
    
    return svgContent;
    
  }

  
}
