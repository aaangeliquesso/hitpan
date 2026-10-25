export const PRODUCT_CATEGORIES = [
  {
    title: 'Lip Products',
    options: [
      'Lipstick',
      'Lip Gloss & Oil',
      'Lip Balm',
      'Lip Liner',
      'Lip Tint',
    ],
  },
  {
    title: 'Face Makeup',
    options: [
      'Foundation & Tint',
      'Concealer',
      'Blush',
      'Bronzer & Contour',
      'Highlighter',
      'Powder',
    ],
  },
  {
    title: 'Eye & Brow',
    options: [
      'Mascara',
      'Eyeshadow',
      'Eyeliner',
      'Brow Product',
      'Eye Primer',
    ],
  },
  {
    title: 'Skincare',
    options: [
      'Cleanser',
      'Toner',
      'Serum',
      'Moisturizer',
      'Sunscreen',
      'Mask & Treatment',
    ],
  },
  {
    title: 'Haircare',
    options: [
      'Shampoo & Conditioner',
      'Hair Treatment',
      'Styling Product',
      'Hair Oil',
    ],
  },
  {
    title: 'Fragrance',
    options: ['Perfume', 'Body Mist', 'Fragrance Oil'],
  },
] as const;

export function getCategoryGroup(category: string) {
  return PRODUCT_CATEGORIES.find((group) =>
    group.options.some((option) => option === category),
  );
}
