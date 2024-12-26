import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
//import { v4 as uuid } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { string } from 'joi';
import { RpcException } from '@nestjs/microservices';
@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const totalRegisters = await this.product.count();
    const totalPages = Math.ceil(totalRegisters / limit);
    if (page > totalPages) {
      throw new NotFoundException(`Page ${page} not found`);
    }
    return {
      meta: {
        totalPages,
        totalRegisters,
        page,
        limit,
      },
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          enabled: true,
        },
      }),
    };
  }

  async findOne(id: number) {
    // const product = this.products.find((product) => product.id === id);
    // if (!product) {
    //   throw new NotFoundException(`No product found with id ${id}`);
    // }
    // return product;
    const product = await this.product.findUnique({
      where: {
        id: id,
        enabled: true,
      },
    });
    if (!product) {
      throw new RpcException({
        message: `No product found with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const { id: __, ...data } = updateProductDto;
      return await this.product.update({
        where: {
          id: id,
          enabled: true,
        },
        data: data,
      });
    } catch (e) {
      throw new RpcException({
        message: `No product found with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }
  }
  async remove(id: string) {
    try {
      return await this.product.update({
        where: {
          id: +id,
        },
        data: {
          enabled: false,
        },
      });
    } catch (e) {
      throw new RpcException({
        message: `No product found with id ${id}`,
        status: HttpStatus.NOT_FOUND,
      });
    }
  }
}
