import { faker } from '@faker-js/faker'
import { PrismaClient, Product } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config()
const prisma = new PrismaClient()

const createProducts = async (quantity: number) => {
  const products: Product[] = []

  for (let i = 0; i < quantity; i++) {
    const productName = faker.commerce.productName()
    const categoryName = faker.commerce.department()

    const product = await prisma.product.create({
      data: {
        name: productName,
        slug: faker.helpers.slugify(productName).toLowerCase(),
        description: faker.commerce.productDescription(),
        price: +faker.commerce.price(10, 999, 0),
        images: Array.from({
          length: faker.datatype.number({ min: 2, max: 6 })
        }).map(() => faker.image.imageUrl(500, 500)),
        category: {
          create: {
            name: categoryName,
            slug: faker.helpers.slugify(categoryName).toLowerCase()
          }
        },
        reviews: {
          create: [
            {
              rating: faker.datatype.number({ min: 1, max: 5 }),
              text: faker.lorem.paragraph(),
              user: {
                connect: {
                  id: 1
                }
              }
            },
            {
              rating: faker.datatype.number({ min: 1, max: 5 }),
              text: faker.lorem.paragraph(),
              user: {
                connect: {
                  id: 1
                }
              }
            }
          ]
        }
      }
    })
    products.push(product)
  }
  // eslint-disable-next-line no-console
  console.log(`Create ${products.length} products`)
}

async function main() {
  // eslint-disable-next-line no-console
  console.log('Start seeding...')
  await createProducts(10)
}

main()
  // eslint-disable-next-line no-console
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect
  })
