export const PAPER_PRICES = {
  '75gsm': { bw: 2, color: 5, label: '75 GSM Standard' },
  '85gsm': { bw: 3, color: 5, label: '85 GSM Executive Bond' },
  '100gsm': { bw: 3, color: 5, label: '100 GSM Executive Paper' },
};

export const BINDING_PRICES = {
  'spiral': { price: 50, label: 'Spiral Binding' },
  'soft': { price: 120, label: 'Soft Binding' },
  'hard': { price: 250, label: 'Hard Binding' },
  'premium': { price: 350, label: 'Thesis Binding Premium' },
};

export function getPagePrice(paperId: string, mode: 'bw' | 'color') {
  const paper = PAPER_PRICES[paperId as keyof typeof PAPER_PRICES] || PAPER_PRICES['85gsm'];
  return paper[mode];
}

export function getBindingPrice(bindingId: string) {
  const binding = BINDING_PRICES[bindingId as keyof typeof BINDING_PRICES];
  return binding ? binding.price : 0;
}

export function calculateOrderSubtotal(opts: { pages: number, colorPages?: number, colorMode: string, paperType: string, binding: string, copies: number }) {
  let colorPages = opts.colorMode === 'color' ? opts.pages : opts.colorMode === 'mixed' ? (opts.colorPages || 0) : 0;
  let bwPages = Math.max(0, opts.pages - colorPages);

  let pageCost = (bwPages * getPagePrice(opts.paperType, 'bw')) + (colorPages * getPagePrice(opts.paperType, 'color'));
  let bindingCost = getBindingPrice(opts.binding);

  return (pageCost + bindingCost) * opts.copies;
}

export function calculateOrderGST(opts: { pages: number, colorPages?: number, colorMode: string, paperType: string, binding: string, copies: number }) {
  return calculateOrderSubtotal(opts) * 0.18;
}

export function calculateOrderTotal(opts: { pages: number, colorPages?: number, colorMode: string, paperType: string, binding: string, copies: number }) {
  return calculateOrderSubtotal(opts) + calculateOrderGST(opts);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
