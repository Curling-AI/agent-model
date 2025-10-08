import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

console.log('🔧 Configurando Stripe e Supabase...');
console.log('🔑 Stripe Secret Key presente:', !!process.env.STRIPE_SECRET_KEY);
console.log('🔑 Stripe Publishable Key presente:', !!process.env.STRIPE_PUBLISHABLE_KEY);
console.log('🔑 Supabase URL presente:', !!process.env.SUPABASE_URL);
console.log('🔑 Supabase Service Role presente:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!
);

interface Plan {
  id: number;
  name: string;
  description: string;
  price_month: number;
  price_year: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: {
    stripe_product_id?: string;
    stripe_price_id_monthly?: string;
    stripe_price_id_yearly?: string;
    [key: string]: any;
  };
}

async function syncPlansToStripe() {
  try {
    console.log('🔄 Iniciando sincronização de planos...');

    console.log('🧪 Testando conexão com Stripe...');
    try {
      const account = await stripe.accounts.retrieve();
      console.log('✅ Stripe conectado! Conta:', account.id);
    } catch (stripeError) {
      console.error('❌ Erro ao conectar com Stripe:', stripeError);
      throw stripeError;
    }

    console.log('🧪 Buscando planos no Supabase...');
    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('❌ Erro do Supabase:', error);
      throw new Error(`Erro ao buscar planos: ${error.message}`);
    }

    console.log(`📋 Encontrados ${plans?.length || 0} planos ativos`);
    console.log('📋 Planos encontrados:', plans?.map(p => ({ id: p.id, name: p.name })));

    for (const plan of plans || []) {
      await createStripeProduct(plan);
    }

    console.log('✅ Sincronização concluída!');
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    process.exit(1);
  }
}

async function createStripeProduct(plan: Plan) {
  try {
    let product: Stripe.Product;
    const stripeProductId = plan.metadata?.stripe_product_id;

    if (stripeProductId) {
      try {
        product = await stripe.products.retrieve(stripeProductId);
        
        product = await stripe.products.update(stripeProductId, {
          name: plan.name,
          description: plan.description,
          metadata: {
            plan_id: plan.id.toString(),
          },
        });
        console.log(`🔄 Produto atualizado: ${plan.name}`);
      } catch (error) {
        console.log(`⚠️ Produto ${stripeProductId} não encontrado no Stripe, criando novo...`);
        product = await createNewStripeProduct(plan);
      }
    } else {
      const existingProducts = await stripe.products.search({
        query: `metadata['plan_id']:'${plan.id}'`,
      });

      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`🔄 Produto encontrado via metadata: ${plan.name}`);
        
        await updatePlanMetadata(plan.id, { stripe_product_id: product.id });
      } else {
        // Criar novo produto
        product = await createNewStripeProduct(plan);
      }
    }

    const monthPrice = await createOrUpdatePrice(product.id, plan, 'month');
    const yearPrice = await createOrUpdatePrice(product.id, plan, 'year');

    await updatePlanMetadata(plan.id, {
      stripe_product_id: product.id,
      stripe_price_id_monthly: monthPrice?.id,
      stripe_price_id_yearly: yearPrice?.id,
    });

  } catch (error) {
    console.error(`❌ Erro ao processar plano ${plan.name}:`, error);
  }
}

async function createNewStripeProduct(plan: Plan): Promise<Stripe.Product> {
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
    metadata: {
      plan_id: plan.id.toString(),
    },
  });
  console.log(`✨ Produto criado: ${plan.name}`);
  return product;
}

async function updatePlanMetadata(planId: number, stripeData: {
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
}) {
  try {
    const { data: currentPlan, error: fetchError } = await supabase
      .from('plans')
      .select('metadata')
      .eq('id', planId)
      .single();

    if (fetchError) {
      console.error(`❌ Erro ao buscar plano ${planId}:`, fetchError);
      return;
    }

    const updatedMetadata = {
      ...(currentPlan?.metadata || {}),
      ...stripeData,
    };

    const { error } = await supabase
      .from('plans')
      .update({ metadata: updatedMetadata })
      .eq('id', planId);

    if (error) {
      console.error(`❌ Erro ao atualizar metadata do plano ${planId}:`, error);
    } else {
      console.log(`📝 Metadata atualizada para plano ${planId}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao atualizar metadata do plano ${planId}:`, error);
  }
}

async function createOrUpdatePrice(productId: string, plan: Plan, interval: 'month' | 'year') {
  try {
    const price = interval === 'month' ? plan.price_month : plan.price_year;
    
    if (!price || price <= 0) {
      console.log(`⏭️ Pulando preço ${interval} para ${plan.name} (valor: ${price})`);
      return;
    }

    const existingPrices = await stripe.prices.list({
      product: productId,
      active: true,
    });

    const existingPrice = existingPrices.data.find(p => 
      p.recurring?.interval === interval &&
      p.metadata?.plan_id === plan.id.toString()
    );

    const priceData = {
      unit_amount: Math.round(price * 100), 
      currency: 'brl', 
      recurring: {
        interval: interval,
      },
      product: productId,
      metadata: {
        plan_id: plan.id.toString(),
        plan_type: interval,
      },
    };

    if (existingPrice) {
      if (existingPrice.unit_amount !== priceData.unit_amount ||
          existingPrice.currency !== priceData.currency) {
        
        await stripe.prices.update(existingPrice.id, { active: false });
        
        const newPrice = await stripe.prices.create(priceData);
        console.log(`💰 Novo preço ${interval} criado: R$ ${price}/${interval} para ${plan.name}`);
        
        return newPrice;
      } else {
        console.log(`💰 Preço ${interval} já existe e está correto: ${plan.name}`);
        return existingPrice;
      }
    } else {
      const newPrice = await stripe.prices.create(priceData);
      console.log(`💰 Preço ${interval} criado: R$ ${price}/${interval} para ${plan.name}`);
      return newPrice;
    }
    
  } catch (error) {
    console.error(`❌ Erro ao criar preço ${interval} para ${plan.name}:`, error);
  }
}

if (import.meta.url.startsWith('file:') && process.argv[1]?.includes('stripe.ts')) {
  syncPlansToStripe();
}

async function syncPricesFromStripe() {
  try {
    console.log('🔄 Iniciando sincronização de preços do Stripe...');

    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });

    for (const product of products.data) {
      if (product.metadata?.plan_id) {
        const planId = parseInt(product.metadata.plan_id);
        
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        const monthPrice = prices.data.find(p => p.metadata?.plan_type === 'month');
        const yearPrice = prices.data.find(p => p.metadata?.plan_type === 'year');

        const priceUpdates: any = {};
        const metadataUpdates: any = {
          stripe_product_id: product.id,
        };
        
        if (monthPrice) {
          priceUpdates.price_month = monthPrice.unit_amount! / 100;
          metadataUpdates.stripe_price_id_monthly = monthPrice.id;
        }
        
        if (yearPrice) {
          priceUpdates.price_year = yearPrice.unit_amount! / 100;
          metadataUpdates.stripe_price_id_yearly = yearPrice.id;
        }

        if (Object.keys(priceUpdates).length > 0) {
          const { error: priceError } = await supabase
            .from('plans')
            .update(priceUpdates)
            .eq('id', planId);

          if (priceError) {
            console.error(`❌ Erro ao atualizar preços do plano ${planId}:`, priceError);
          }
        }

        await updatePlanMetadata(planId, metadataUpdates);
        console.log(`📝 Preços sincronizados do Stripe para plano ${planId}`);
      }
    }

    console.log('✅ Sincronização de preços concluída!');
  } catch (error) {
    console.error('❌ Erro na sincronização de preços:', error);
  }
}

export { syncPlansToStripe, syncPricesFromStripe };