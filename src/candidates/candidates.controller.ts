import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { CandidatesService } from './candidates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

const candidateImageStorage = diskStorage({
  destination: (_req, _file, callback) => {
    const uploadPath = join(process.cwd(), 'uploads', 'candidates');
    mkdirSync(uploadPath, { recursive: true });
    callback(null, uploadPath);
  },
  filename: (_req, file, callback) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    callback(null, `candidate-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const candidateImageInterceptor = FileInterceptor('image', {
  storage: candidateImageStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new BadRequestException('Candidate image must be an image file.'), false);
      return;
    }
    callback(null, true);
  },
});

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.candidatesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(candidateImageInterceptor)
  create(
    @Body() body: { name: string; description?: string; position: string },
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.candidatesService.create({
      ...body,
      imageUrl: image ? `/uploads/candidates/${image.filename}` : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  @UseInterceptors(candidateImageInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { name?: string; description?: string; position?: string },
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.candidatesService.update(id, {
      ...body,
      imageUrl: image ? `/uploads/candidates/${image.filename}` : undefined,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.remove(id);
  }
}
