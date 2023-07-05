import { Controller, Get } from '@nestjs/common';
import { ITreenode } from 'src/models/treenode.model';
import { CategoryService } from 'src/services/category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('all')
  getRecentScrobbles(
  ): Promise<ITreenode[]> {
    return this.categoryService.getCategories();
  }
}
