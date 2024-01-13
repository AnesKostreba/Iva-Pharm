export class EditArticleDto{
    name: string;
    categoryId: number;
    excerpt: string;
    description: string;
    status: 'available'|'visible'|'hidden';
    is_promoted: 0 | 1;
    price: number;
    features:{
        featureId: number;
        value: string
    }[] | null;
}