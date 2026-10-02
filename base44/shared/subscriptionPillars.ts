const PRICE_PILLARS = {
  price_1Tz4tdI9tsZ7WvXeTLjCI6Us: 'core', price_1Tz4tdI9tsZ7WvXezqEVGeuU: 'core',
  price_1Tz4tdI9tsZ7WvXeftDZEprF: 'research', price_1Tz4tdI9tsZ7WvXetqVuOYzj: 'research',
  price_1Tn2eSI9tsZ7WvXe3JMrHrYf: 'core', price_1Tn2eSI9tsZ7WvXeVksFLuTl: 'core',
  price_1Tn2eSI9tsZ7WvXeJuOqhhJa: 'research', price_1Tn2eSI9tsZ7WvXePJt1xh7M: 'research',
};
const PRODUCT_PILLARS = {
  prod_Uz2zg9w7vHTZPN: 'core', prod_Umbsfu6v3MkXw9: 'core', prod_UNEqSTdMlfJZxy: 'core',
  prod_USqaSZGzzQUwzm: 'core', prod_Uz2zrpmv8Nmvxi: 'research', prod_Umbsyt9rUqVohe: 'research',
};
export function subscriptionPillars(subscriptions) {
  return [...new Set(subscriptions.filter(s => ['active', 'trialing'].includes(s.status)).flatMap(s => {
    const line = s.metadata?.product_line;
    const fromMetadata = ['core', 'research'].includes(line) ? [line] : [];
    return [...fromMetadata, ...(s.items?.data || []).map(i => PRICE_PILLARS[i.price?.id] || PRODUCT_PILLARS[typeof i.price?.product === 'string' ? i.price.product : i.price?.product?.id]).filter(Boolean)];
  }))];
}