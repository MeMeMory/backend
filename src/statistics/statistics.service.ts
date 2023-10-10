import { Injectable } from '@nestjs/common'
import console from 'console'
import { PrismaService } from 'src/prisma.service'
import { UserService } from './../user/user.service'

@Injectable()
export class StatisticsService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}
  async getMain(userId: number) {
    const user = await this.userService.byId(userId, {
      orders: {
        select: {
          items: true
        }
      },
      reviews: true
    })

    console.log(user.orders.map((el) => el))

    return [
      {
        name: 'Orders',
        value: user.orders.length
      },
      {
        name: 'Reviews',
        value: user.reviews.length
      },
      {
        name: 'Favorites',
        value: user.favorites.length
      },
      {
        name: 'Total amount',
        value: user.orders
      }
    ]
  }
}
