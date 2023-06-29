import { Controller, Get } from '@nestjs/common';
import { Category } from 'src/models/category.model';
import { CategoryService } from 'src/services/category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('all')
  getRecentScrobbles(
  ): Promise<Category[]> {
    return this.categoryService.getCategories();
  }
}
