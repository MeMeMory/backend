import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { generateSlug } from 'src/utils/generate-slug'
import { CategoryDto } from './category.dto'
import { returnCategoryObject } from './return-category.object'

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async byId(id: number) {
    return await this.getCategory(id)
  }

  async bySlug(slug: string) {
    return await this.getCategory(slug)
  }

  async getAll() {
    return this.prisma.category.findMany({
      select: returnCategoryObject
    })
  }

  async create() {
    return this.prisma.category.create({
      data: {
        name: '',
        slug: ''
      }
    })
  }

  async update(id: number, dto: CategoryDto) {
    return this.prisma.category.update({
      where: {
        id
      },
      data: {
        name: dto.name,
        slug: generateSlug(dto.name)
      }
    })
  }

  async delete(id: number) {
    return this.prisma.category.delete({ where: { id } })
  }

  private async getCategory(type: any) {
    const condition = isNaN(type) ? { slug: type } : { id: type }

    const category = await this.prisma.category.findUnique({
      where: condition,
      select: returnCategoryObject
    })

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return category
  }
}
