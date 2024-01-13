import { Body, Controller, Delete, Get, Param, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Crud, CrudRequest, Override, ParsedRequest } from "@nestjsx/crud";
import { AddArticleDto } from "src/dtos/article/add.article.dto";
import { Article } from "src/entities/article.entity";
import { ArticleService } from "src/services/article/article.service";
import { diskStorage } from 'multer'
import { StorageConfig } from "config/storage.config";
import { fileName } from "typeorm-model-generator/dist/src/NamingStrategy";
import { PhotoService } from "src/services/photo/photo.service";
import { Photo } from "src/entities/photo.entity";
import { ApiResponse } from "src/misc/api.response.class";
import * as fileType from 'file-type';
import * as fs from 'fs';
import * as sharp from "sharp";

@Controller('api/article')
@Crud({
    model: {
        type: Article
    },
    params: {
        id: {
            field: 'article_id',
            type: 'number',
            primary: true
        }
    },
    query: {
        join: {
            category: {
                eager: true
            },
            articleFeatures: {
                eager: false
            },
            photos: {
                eager: true
            },
            articlePrices: {
                eager: true
            },
            features: {
                eager: true
            }
        }
    },
})
export class ArticleController {
    constructor(
        public service: ArticleService,

        public photoService: PhotoService
    ) { }

    @Get()
    @Override()
    async getMany(@ParsedRequest() req: CrudRequest) {
        return this.service.getMany(req);
    }

    @Get(':id')
    async getOne(@Param('id') id: number): Promise<Article> {
        const article = await this.service.findOne({
            where: { articleId: id, },
            relations: ['category', 'photos', 'articlePrices', 'articleFeatures']
        });

        return article;
    }

    @Post('createFull') // POST http://localhost:3000/api/article/createFull/
    createFullArticle(@Body() data: AddArticleDto) {
        return this.service.createFullArticle(data);
    }

    @Post(':id/uploadPhoto')// POST http://localhost:3000/api/article/:id/uploadPhoto
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: StorageConfig.photo.destination,
                filename: (req, file, callback) => {
                    //'Neka   slika.jpg ->
                    //20240102-2340184031-Neka-slika.jpg zeljeni filename

                    let original: string = file.originalname;

                    let normalized = original.replace(/\s+/g, '-');
                    normalized = normalized.replace(/[^A-z0-9\.\-]/g, '');
                    let sada = new Date();
                    let datePart = '';
                    datePart += sada.getFullYear().toString();
                    datePart += (sada.getMonth() + 1).toString() // jer je od 0-11 i dodajemo 1 -> 12
                    datePart += sada.getDate().toString();

                    let randomPart: string =
                        new Array(10)
                            .fill(0)
                            .map(e => (Math.random() * 9).toFixed(0).toString())
                            .join('');

                    let fileName = datePart + '-' + randomPart + '-' + normalized;

                    fileName = fileName.toLocaleLowerCase();

                    callback(null, fileName);
                }
            }),
            fileFilter: (req, file, callback) => {
                // 1. Check ektenzija: JPG , PNG

                if (!file.originalname.toLowerCase().match(/\.(jpg|png)$/)) {
                    req.fileFilterError = 'Bad file extension!';
                    callback(null, false);
                    return;
                }
                // 2. Check tipa sadrzaja: image/jpg, image/png (mimetype)
                if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
                    req.fileFilterError = 'Bad file content type!';
                    callback(null, false);
                    return;
                }

                callback(null, true)
            },

            limits: {
                files: 1,
                fileSize: StorageConfig.photo.maxSize
            }
        })
    )
    async uploadPhoto(
        @Param('id') articleId: number,
        @UploadedFile() photo,
        @Req() req
    ): Promise<ApiResponse | Photo> {

        if (req.fileFilterError) {
            return new ApiResponse('error', -4002, req.fileFilterError);
        }

        if (!photo) {
            return new ApiResponse('error', -4002, 'File not uploaded!');
        }

        const fileTypeResult = await fileType.fromFile(photo.path);
        if (!fileTypeResult) {
            fs.unlinkSync(photo.path);

            return new ApiResponse('error', -4002, 'Cannot detect file type!');
        }

        const realMimeType = fileTypeResult.mime;
        if (!(realMimeType.includes('jpeg') || realMimeType.includes('png'))) {
            fs.unlinkSync(photo.path);

            return new ApiResponse('error', -4002, 'Bad file content type!');
        }


        //TODO: Save a resized file


        await this.createResizedImage(photo, StorageConfig.photo.resize.thumb);
        await this.createResizedImage(photo, StorageConfig.photo.resize.small);
        await this.createResizedImage(photo, StorageConfig.photo.resize.medium);


        const newPhoto: Photo = new Photo();
        newPhoto.articleId = articleId;
        newPhoto.imagePath = photo.filename;

        const savedPhoto = await this.photoService.add(newPhoto);
        if (!savedPhoto) {
            return new ApiResponse('error', -4001); // -4001 file upload failed
        }

        return savedPhoto;
    }


    async createResizedImage(photo, resizeSettings) {
        const originalFilePath = photo.path;
        const fileName = photo.filename;

        const destinationFilePath =
            StorageConfig.photo.destination +
            resizeSettings.directory +
            fileName;

        await sharp(originalFilePath)
            .resize({
                fit: 'cover',
                width: resizeSettings.width,
                height: resizeSettings.height,
            })
            .toFile(destinationFilePath);
    }

    // http://localhost:3000/api/article/1/deletePhoto/45/
    @Delete(':articleId/deletePhoto/:photoId')
    public async deletePhoto(
        @Param('article') articleId: number,
        @Param('photoId') photoId: number) {
        const photo = await this.photoService.findOne({
            where: {
                articleId: articleId,
                photoId: photoId
            }
        })
        if (!photo) {
            return new ApiResponse('error', -4004, 'Photo not found')
        }

        try {
            fs.unlinkSync(StorageConfig.photo.destination + photo.imagePath);
            fs.unlinkSync(StorageConfig.photo.destination +
                StorageConfig.photo.resize.thumb.directory + photo.imagePath);
            fs.unlinkSync(StorageConfig.photo.destination +
                StorageConfig.photo.resize.small.directory + photo.imagePath);
        }catch(e){
            
        }

            const deleteResult = await this.photoService.deleteById(photoId);

        if (deleteResult.affected === 0) { // broj obrisanih iz baze affect
            return new ApiResponse('error', -4004, 'Photo not found')
        }

        return new ApiResponse('ok', 0, 'One photo deleted!')

    }
}