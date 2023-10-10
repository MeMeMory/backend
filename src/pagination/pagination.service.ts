import { Injectable } from '@nestjs/common'
import { PaginationDto } from './category.dto'

@Injectable()
export class PaginationService {
  getPagination(dto: PaginationDto, defaultPerPage = 30) {
    const page = dto.page ? +dto.page : 1
    const perPage = dto.page ? +dto.perPage : defaultPerPage

    const skip = (page - 1) * perPage

    return { perPage, skip }
  }
}
