import { NotFoundException } from '@nestjs/common'
import { returnCategoryObject } from 'src/category/return-category.object'

export async function getCategoryBy(by: any): Promise<string> {
  const category = await this.prisma.category.findUnique({
    where: { by },
    select: returnCategoryObject
  })

  if (!category) {
    throw new NotFoundException('Category not found')
  }

  return category
}
