const FONT_COLOR = 'FFFFFF'; // White text for all placeholders

const baseColors: string[] = [
    '#ef4444', '#22c55e', '#3b82f6', '#a855f7',
    '#eab308', '#ec4899', '#6366f1', '#14b8a6',
    '#f97316', '#84cc16'
];

const tailwindColorMap: { [key: string]: string } = {
    '#ef4444': 'bg-red-500',
    '#22c55e': 'bg-green-500',
    '#3b82f6': 'bg-blue-500',
    '#a855f7': 'bg-purple-500',
    '#eab308': 'bg-yellow-500',
    '#ec4899': 'bg-pink-500',
    '#6366f1': 'bg-indigo-500',
    '#14b8a6': 'bg-teal-500',
    '#f97316': 'bg-orange-500',
    '#84cc16': 'bg-lime-500',
    '#6b7280': 'bg-gray-500'
};

const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

const getColorFromString = (str: string): string => {
    const hash = hashCode(str);
    const index = Math.abs(hash) % baseColors.length;
    return baseColors[index];
};

const generatePlaceholder = (category: string) => {
    const color = getColorFromString(category).substring(1); // remove #
    const letter = category.charAt(0).toUpperCase();
    return `https://placehold.co/40x40/${color}/${FONT_COLOR}?text=${letter}&font=lato`;
};

export const getCategoryColor = (category: string): string => {
    const preDefined = preDefinedCategoryColors[category];
    if (preDefined) return preDefined.replace('bg-', '#').replace('-500', '');
    return getColorFromString(category);
}

const preDefinedCategoryImages: { [key: string]: string } = {
  'Food': `https://placehold.co/40x40/ef4444/${FONT_COLOR}?text=F&font=lato`,
  'Groceries': `https://placehold.co/40x40/22c55e/${FONT_COLOR}?text=G&font=lato`,
  'Transport': `https://placehold.co/40x40/3b82f6/${FONT_COLOR}?text=T&font=lato`,
  'Entertainment': `https://placehold.co/40x40/a855f7/${FONT_COLOR}?text=E&font=lato`,
  'Utilities': `https://placehold.co/40x40/eab308/${FONT_COLOR}?text=U&font=lato`,
  'Shopping': `https://placehold.co/40x40/ec4899/${FONT_COLOR}?text=S&font=lato`,
  'Health': `https://placehold.co/40x40/6366f1/${FONT_COLOR}?text=H&font=lato`,
  'Other': `https://placehold.co/40x40/6b7280/${FONT_COLOR}?text=O&font=lato`,
};

export const categoryImages = new Proxy(preDefinedCategoryImages, {
    get(target, prop: string) {
        return target[prop] || generatePlaceholder(prop);
    }
});

const preDefinedCategoryColors: { [key:string]: string } = {
    'Food': 'bg-red-500',
    'Groceries': 'bg-green-500',
    'Transport': 'bg-blue-500',
    'Entertainment': 'bg-purple-500',
    'Utilities': 'bg-yellow-500',
    'Shopping': 'bg-pink-500',
    'Health': 'bg-indigo-500',
    'Other': 'bg-gray-500',
};

export const categoryColors = new Proxy(preDefinedCategoryColors, {
    get(target, prop: string) {
        const colorHex = getColorFromString(prop);
        return target[prop] || tailwindColorMap[colorHex] || 'bg-gray-500';
    }
});