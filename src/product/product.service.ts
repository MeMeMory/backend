import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PaginationService } from 'src/pagination/pagination.service'
import { PrismaService } from 'src/prisma.service'
import { returnProductObjectFullest } from 'src/product/return-product.object'
import { generateSlug } from 'src/utils/generate-slug'
import { EnumProductSort, GetAllProductDto } from './dto/get-all.product.dto'
import { ProductDto } from './product.dto'

@Injectable()
export class ProductService {
  PaginationService: any
  constructor(
    private prisma: PrismaService,
    private paginationService: PaginationService
  ) {}

  async getAll(dto: GetAllProductDto = {}) {
    const { sort, searchTerm } = dto

    const prismaSort: Prisma.ProductOrderByWithRelationInput[] = []

    if (sort === EnumProductSort.LOW_PRICE) {
      prismaSort.push({ price: 'asc' })
    } else if (sort === EnumProductSort.HIGH_PRICE) {
      prismaSort.push({ price: 'desc' })
    } else if (sort === EnumProductSort.OLDEST) {
      prismaSort.push({ createdAt: 'asc' })
    } else prismaSort.push({ createdAt: 'desc' })

    const prismaSearchTermFilter: Prisma.ProductWhereInput = searchTerm
      ? {
          OR: [
            {
              category: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive'
                }
              }
            },
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          ]
        }
      : {}

    const { perPage, skip } = this.paginationService.getPagination(dto)

    const products = await this.prisma.product.findMany({
      where: prismaSearchTermFilter,
      orderBy: prismaSort,
      skip,
      take: perPage
    })

    return {
      products,
      length: await this.prisma.product.count({
        where: prismaSearchTermFilter
      })
    }
  }

  async byId(id: number) {
    return await this.getProduct(id)
  }

  async bySlug(slug: string) {
    return await this.getProduct(slug)
  }

  async byCategory(categorySlug: string) {
    const products = await this.prisma.product.findMany({
      where: {
        category: {
          slug: categorySlug
        }
      },
      select: returnProductObjectFullest
    })

    if (!products) {
      throw new NotFoundException('product not found')
    }

    return products
  }

  async getSimilar(id: number) {
    const currentProduct = await this.byId(id)

    if (!currentProduct) {
      throw new NotFoundException('product not found')
    }

    const products = await this.prisma.product.findMany({
      where: {
        category: {
          name: currentProduct.category.name
        },
        NOT: { id: currentProduct.id }
      },
      orderBy: { createdAt: 'desc' },
      select: returnProductObjectFullest
    })

    return products
  }

  async create() {
    const product = await this.prisma.product.create({
      data: {
        name: '',
        slug: '',
        price: 0,
        description: ''
      }
    })
    return product.id
  }

  async update(id: number, dto: ProductDto) {
    const { description, images, price, name, categoryId } = dto

    return this.prisma.product.update({
      where: {
        id
      },
      data: {
        description,
        images,
        price,
        name,
        slug: generateSlug(dto.name),
        category: {
          connect: {
            id: categoryId
          }
        }
      }
    })
  }

  async delete(id: number) {
    return this.prisma.product.delete({ where: { id } })
  }

  private async getProduct(type: any) {
    const condition = isNaN(type) ? { slug: type } : { id: type }

    const product = await this.prisma.product.findUnique({
      where: condition,
      select: returnProductObjectFullest
    })

    if (!product) {
      throw new NotFoundException('product not found')
    }

    return product
  }
}
