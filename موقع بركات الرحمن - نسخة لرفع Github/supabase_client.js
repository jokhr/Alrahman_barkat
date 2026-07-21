// Initialize Supabase Client
const _SUPABASE_URL = 'https://kcvdohodujsuatipkrbf.supabase.co';
const _SUPABASE_KEY = 'sb_publishable_R3VnisAW1GfF6dvOjnezaA_oqZs2OAm';

window.supabase = window.supabase.createClient(_SUPABASE_URL, _SUPABASE_KEY);

// Helper function to fetch data and optionally fallback to LocalStorage if Supabase fails or is empty
async function fetchStoreDataCloud() {
    try {
        const [pRes, cRes, bRes, bnRes] = await Promise.all([
            supabase.from('products').select('*'),
            supabase.from('categories').select('*'),
            supabase.from('brands').select('*'),
            supabase.from('banners').select('*').order('display_order', {ascending: true})
        ]);
        
        if (pRes.error) console.error("Error fetching products:", pRes.error);
        if (cRes.error) console.error("Error fetching categories:", cRes.error);
        if (bRes.error) console.error("Error fetching brands:", bRes.error);
        if (bnRes.error) console.error("Error fetching banners:", bnRes.error);

        
        if (!pRes.error && !cRes.error && !bRes.error && !bnRes.error) {
             let fetchedBanners = bnRes.data || [];
             
             // Extract settings
             const settingsBannerIndex = fetchedBanners.findIndex(b => b.id === 'STORE_SETTINGS_JSON');
             if (settingsBannerIndex !== -1) {
                 const settingsBanner = fetchedBanners.splice(settingsBannerIndex, 1)[0];
                 try {
                     localStorage.setItem('STORE_SETTINGS', settingsBanner.title);
                 } catch(e) {}
             }
             
             return {

                                  products: (pRes.data || []).map(p => {
                     let desc = p.desc || '';
                     let stock = 10;
                     let isNew = false;
                     let oldPrice = 0;
                     let specs = [];
                     let extraImages = [];
                     let metaMatch = desc.match(/\|\|\|META:(.+)$/);
                     if (metaMatch) {
                         try { 
                             let meta = JSON.parse(metaMatch[1]); 
                             desc = desc.replace(metaMatch[0], '');
                             stock = meta.stock !== undefined ? meta.stock : 10;
                             isNew = meta.isNew || false;
                             oldPrice = meta.oldPrice || 0;
                             specs = meta.specs || [];
                             extraImages = meta.images || [];
                         } catch(e) {}
                     } else {
                         stock = p.stock !== undefined ? p.stock : 10;
                         isNew = p.is_new || false;
                         specs = (p.specs || '').split('\n');
                     }
                     return {
                         id: p.id, name: p.name, price: Number(String(p.price).replace(/[,.]/g, '')) || 0, desc: desc, oldPrice: Number(String(oldPrice).replace(/[,.]/g, '')) || 0, categoryId: p.category, brand: p.brand, img: p.img, colors: p.colors || '',
                         stock: stock, isNew: isNew, specs: specs, images: extraImages.length > 0 ? extraImages : (p.images ? p.images : (p.img ? [p.img] : []))
                     };
                 }),
                 categories: (cRes.data || []).map(c => ({ id: c.id, name: c.name, icon: c.icon || c.img || 'fa-box', order: c.display_order || 0 })),
                 brands: (bRes.data || []).map(b => ({ id: b.id, name: b.name, logo: b.logo })),
                 banners: (fetchedBanners || []).map(bn => ({ id: bn.id, title: bn.title, subtitle: bn.subtitle, img: bn.image, order: bn.display_order })),
                 discounts: []
             };
        }
    } catch (e) {
        console.error("Supabase connection error:", e);
    }
    
    // Fallback to local storage if supabase fails
    return JSON.parse(localStorage.getItem('STORE_DATA')) || { products: [], brands: [], categories: [], banners: [], discounts: [] };
}
