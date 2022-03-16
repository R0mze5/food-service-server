import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
  async getOrCreate(name: string): Promise<Category | undefined> {
    const categoryName =
      typeof name === 'string' ? name.trim().toLowerCase() : null;

    let category;

    if (categoryName) {
      const categorySlug = categoryName.replace(/\s/g, '-');

      category = await this.findOne({ slug: categorySlug });

      if (!category) {
        category = this.create({
          name: categoryName,
          slug: categorySlug,
        });
        await this.save(category);
      }
    }

    return category;
  }
}
