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
  type: 'subscription' | 'transactional';
  active: boolean;
  created_at: string;
  updated_at: string;
  metadata?: {
    stripe_product_id?: string;
    stripe_price_id_monthly?: string;
    stripe_price_id_yearly?: string;
    stripe_price_id?: string;
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
            plan_type: plan.type,
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

    if (plan.type === 'subscription') {
      // Para planos de assinatura, criar preços mensais e anuais
      const monthPrice = await createOrUpdateSubscriptionPrice(product.id, plan, 'month');
      const yearPrice = await createOrUpdateSubscriptionPrice(product.id, plan, 'year');

      await updatePlanMetadata(plan.id, {
        stripe_product_id: product.id,
        stripe_price_id_monthly: monthPrice?.id,
        stripe_price_id_yearly: yearPrice?.id,
      });
    } else if (plan.type === 'transactional') {
      // Para planos transacionais, verificar se já existe um preço no metadata
      const existingPriceId = plan.metadata?.stripe_price_id;
      
      if (existingPriceId) {
        try {
          await stripe.prices.retrieve(existingPriceId);
          console.log(`💰 Preço transacional já existe: ${plan.name}`);
        } catch (error) {
          console.log(`⚠️ Preço ${existingPriceId} não encontrado, será necessário criar/atualizar via Stripe Dashboard`);
        }
      }

      await updatePlanMetadata(plan.id, {
        stripe_product_id: product.id,
        stripe_price_id: existingPriceId,
      });
    }

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
      plan_type: plan.type,
    },
  });
  console.log(`✨ Produto criado: ${plan.name}`);
  return product;
}

async function updatePlanMetadata(planId: number, stripeData: {
  stripe_product_id?: string;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  stripe_price_id?: string;
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

async function createOrUpdateSubscriptionPrice(productId: string, plan: Plan, interval: 'month' | 'year') {
  try {
    // Para planos de assinatura, vamos verificar se já existe um price_id no metadata
    const existingPriceId = interval === 'month' 
      ? plan.metadata?.stripe_price_id_monthly 
      : plan.metadata?.stripe_price_id_yearly;

    if (existingPriceId) {
      try {
        const existingPrice = await stripe.prices.retrieve(existingPriceId);
        console.log(`💰 Preço ${interval} já existe: ${plan.name} (${existingPriceId})`);
        return existingPrice;
      } catch (error) {
        console.log(`⚠️ Preço ${existingPriceId} não encontrado no Stripe para ${plan.name}`);
        console.log(`ℹ️ Este preço deve ser criado manualmente no Stripe Dashboard`);
        return null;
      }
    } else {
      console.log(`ℹ️ Nenhum price_id encontrado no metadata para ${interval} do plano ${plan.name}`);
      console.log(`ℹ️ Os preços devem ser criados manualmente no Stripe Dashboard e atualizados no metadata`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erro ao verificar preço ${interval} para ${plan.name}:`, error);
    return null;
  }
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
        const planType = product.metadata?.plan_type;
        
        const prices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        const metadataUpdates: any = {
          stripe_product_id: product.id,
        };

        if (planType === 'subscription') {
          const monthPrice = prices.data.find(p => p.recurring?.interval === 'month');
          const yearPrice = prices.data.find(p => p.recurring?.interval === 'year');
          
          if (monthPrice) {
            metadataUpdates.stripe_price_id_monthly = monthPrice.id;
          }
          
          if (yearPrice) {
            metadataUpdates.stripe_price_id_yearly = yearPrice.id;
          }
        } else if (planType === 'transactional') {
          const oneTimePrice = prices.data.find(p => !p.recurring);
          
          if (oneTimePrice) {
            metadataUpdates.stripe_price_id = oneTimePrice.id;
          }
        }

        await updatePlanMetadata(planId, metadataUpdates);
        console.log(`� Preços sincronizados do Stripe para plano ${planId} (tipo: ${planType})`);
      }
    }

    console.log('✅ Sincronização de preços concluída!');
  } catch (error) {
    console.error('❌ Erro na sincronização de preços:', error);
  }
}

async function verifyAndSyncPlans() {
  try {
    console.log('🔎 Verificando consistência entre DB e Stripe para planos...');

    const { data: plans, error } = await supabase
      .from('plans')
      .select('*')
      .eq('active', true);

    if (error) {
      console.error('❌ Erro ao buscar planos no Supabase:', error);
      return;
    }

    for (const plan of (plans || []) as Plan[]) {
      try {
        console.log(`\n➡️  Processando plano ${plan.id} - ${plan.name} (type: ${plan.type})`);

        // 1) localizar produto no Stripe
        let product: Stripe.Product | null = null;
        const stripeProductId = plan.metadata?.stripe_product_id;

        if (stripeProductId) {
          try {
            product = await stripe.products.retrieve(stripeProductId);
          } catch (err) {
            console.log(`   ⚠️ Produto com id ${stripeProductId} não encontrado no Stripe`);
            product = null;
          }
        }

        if (!product) {
          // tentar localizar por metadata.plan_id
          const found = await stripe.products.search({
            query: `metadata['plan_id']:'${plan.id}'`,
          });
          if (found.data && found.data.length > 0) {
            product = found.data[0];
            console.log(`   🔎 Produto encontrado no Stripe via metadata.plan_id: ${product.id}`);
          }
        }

        if (!product) {
          console.log('   ℹ️ Produto não encontrado no Stripe. Será criado ao sincronizar (opcional).');
          // createNewStripeProduct would create it, but here we just report
          continue;
        }

        // 2) garantir metadata no Stripe: plan_id e plan_type
        const prodMeta = (product.metadata || {}) as Record<string, any>;
        const metaUpdates: Record<string, string> = {};
        if (prodMeta.plan_id !== String(plan.id)) {
          metaUpdates.plan_id = String(plan.id);
        }
        if (prodMeta.plan_type !== plan.type) {
          metaUpdates.plan_type = plan.type;
        }

        if (Object.keys(metaUpdates).length > 0) {
          try {
            await stripe.products.update(product.id, {
              metadata: {
                ...(product.metadata || {}),
                ...metaUpdates,
              },
            });
            console.log(`   ✅ Atualizado metadata do produto ${product.id} no Stripe:`, metaUpdates);
          } catch (err) {
            console.error(`   ❌ Erro ao atualizar metadata do produto ${product.id}:`, err);
          }
        }

        // 3) verificar name/description
        if (product.name !== plan.name || (product.description || '') !== (plan.description || '')) {
          try {
            await stripe.products.update(product.id, {
              name: plan.name,
              description: plan.description,
            });
            console.log(`   ✅ Produto Stripe atualizado (name/description) para refletir DB`);
          } catch (err) {
            console.error(`   ❌ Erro ao atualizar name/description do produto ${product.id}:`, err);
          }
        } else {
          console.log('   ✅ Name/description já coincidem');
        }

        // 4) garantir que DB tenha stripe_product_id
        const updatesToDb: any = {};
        if (!plan.metadata?.stripe_product_id) {
          updatesToDb.stripe_product_id = product.id;
        }

        // 5) buscar preços no Stripe e preencher metadata faltante no DB
        const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });

        if (plan.type === 'subscription') {
          const monthPrice = prices.data.find(p => p.recurring?.interval === 'month');
          const yearPrice = prices.data.find(p => p.recurring?.interval === 'year');

          if (!plan.metadata?.stripe_price_id_monthly && monthPrice) {
            updatesToDb.stripe_price_id_monthly = monthPrice.id;
            console.log(`   ✅ Encontrado price monthly no Stripe: ${monthPrice.id}`);
          }
          if (!plan.metadata?.stripe_price_id_yearly && yearPrice) {
            updatesToDb.stripe_price_id_yearly = yearPrice.id;
            console.log(`   ✅ Encontrado price yearly no Stripe: ${yearPrice.id}`);
          }
        } else if (plan.type === 'transactional') {
          const oneTime = prices.data.find(p => !p.recurring);
          if (!plan.metadata?.stripe_price_id && oneTime) {
            updatesToDb.stripe_price_id = oneTime.id;
            console.log(`   ✅ Encontrado price one-time no Stripe: ${oneTime.id}`);
          }
        }

        // 6) aplicar updates no DB se houver
        if (Object.keys(updatesToDb).length > 0) {
          try {
            await updatePlanMetadata(plan.id, updatesToDb as any);
            console.log('   📝 Metadata do DB atualizada:', updatesToDb);
          } catch (err) {
            console.error('   ❌ Erro ao atualizar metadata no DB:', err);
          }
        } else {
          console.log('   ✅ Metadata do DB já contém os campos necessários');
        }

      } catch (err) {
        console.error(`   ❌ Erro ao processar plano ${plan.id}:`, err);
      }
    }

    console.log('\n🔎 Verificação finalizada');
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// permitir executar via linha de comando: node stripe.ts verify
if (import.meta.url.startsWith('file:') && (process.argv.includes('verify') || process.argv.includes('--verify'))) {
  verifyAndSyncPlans();
}

// permitir executar via linha de comando padrão: node stripe.ts
if (import.meta.url.startsWith('file:') && process.argv[1]?.includes('stripe.ts') && !process.argv.includes('verify') && !process.argv.includes('--verify')) {
  syncPlansToStripe();
}

export { syncPlansToStripe, syncPricesFromStripe, verifyAndSyncPlans };
