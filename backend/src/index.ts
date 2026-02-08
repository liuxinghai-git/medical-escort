import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  PAYPAL_WEBHOOK_ID: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 1. 全局 CORS 配置
app.use('/*', cors({
  origin: '*', 
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}))

const getSupabase = (c: any) => {
  return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY)
}

app.get('/', (c) => c.text('Med-China API is Running (Cloudflare Workers)'))

/**
 * 用户端：创建/更新 Case
 */
app.post('/api/cases', async (c) => {
  const supabase = getSupabase(c)
  const body = await c.req.json()
  
  const { data: existingCase } = await supabase
    .from('cases')
    .select('id')
    .eq('user_email', body.email)
    .eq('stage1_paid', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingCase) {
    await supabase.from('cases').update({
        patient_name: body.name,
        symptoms: body.symptoms,
        target_city: body.city,
        target_hospital: body.hospital
    }).eq('id', existingCase.id);
    return c.json({ caseId: existingCase.id, message: 'Resumed draft' })
  }

  const { data, error } = await supabase
    .from('cases')
    .insert([{
      user_email: body.email,
      patient_name: body.name,
      symptoms: body.symptoms,
      target_city: body.city,
      target_hospital: body.hospital,
      status: 'draft'
    }])
    .select().single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ caseId: data.id })
})

app.get('/api/cases/:id', async (c) => {
  const supabase = getSupabase(c)
  const id = c.req.param('id')
  const { data, error } = await supabase.from('cases').select('*').eq('id', id).single()
  if (error) return c.json({ error: 'Not found' }, 404)
  return c.json(data)
})

/**
 * Webhook 核心逻辑
 */
app.post('/api/webhooks/paypal', async (c) => {
  const supabase = getSupabase(c)
  let body;
  try { body = await c.req.json(); } catch (e) { return c.text('Invalid JSON', 400); }

  const eventType = body.event_type
  const resource = body.resource

  // 1. 记录日志 (增加一个标记方便搜索)
  await supabase.from('webhook_logs').insert({
    event_type: eventType,
    payload: body
  })

  // 2. 增强型获取 custom_id (兼容模拟器和真实支付)
  const customId = resource.custom_id || (resource.purchase_units && resource.purchase_units[0]?.custom_id);

  if (!customId) {
    console.log("Webhook skipped: No custom_id found.");
    return c.json({ received: true, note: "no_custom_id" });
  }

  const [caseId, stage] = customId.split(':');

  // A. 处理付款成功 (Stage 1 或 Stage 2 的 Capture)
  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    if (stage === 'stage_1') {
      const { error } = await supabase.from('cases')
        .update({ stage1_paid: true, stage1_txn_id: resource.id, status: 'pending_stage2' })
        .eq('id', caseId);
      if (error) await supabase.from('webhook_logs').insert({ event_type: 'DB_UPDATE_ERROR', payload: { error: error.message, caseId } });
    } 
    else if (stage === 'stage_2') {
      await supabase.from('cases').update({ stage2_status: 'captured', status: 'escrow_completed' }).eq('id', caseId);
    }
    else if (stage === 'stage_3') {
        await supabase.from('cases').update({ stage3_status: 'paid' }).eq('id', caseId);
    }
  }

  // B. 处理 Stage 2 托管成功 (AUTHORIZATION.CREATED)
  if (eventType === 'PAYMENT.AUTHORIZATION.CREATED' && stage === 'stage_2') {
    const { error } = await supabase.from('cases')
      .update({ stage2_status: 'authorized', stage2_auth_id: resource.id, status: 'escrow_secured' })
      .eq('id', caseId);
    if (error) await supabase.from('webhook_logs').insert({ event_type: 'DB_UPDATE_ERROR', payload: { error: error.message, caseId } });
  }

  // C. 处理 Stage 2 退款/取消 (AUTHORIZATION.VOIDED)
  if (eventType === 'PAYMENT.AUTHORIZATION.VOIDED' && stage === 'stage_2') {
    await supabase.from('cases').update({ stage2_status: 'voided', status: 'refunded' }).eq('id', caseId);
  }

  return c.json({ received: true })
})

/**
 * 管理员 API
 */
app.get('/api/admin/all-cases', async (c) => {
  const { data, error } = await getSupabase(c).from('cases').select('*').order('created_at', { ascending: false })
  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

app.post('/api/admin/release-funds', async (c) => {
  const { caseId } = await c.req.json()
  const { error } = await getSupabase(c).from('cases').update({ stage2_status: 'captured', status: 'completed' }).eq('id', caseId)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ status: 'success' })
})

app.post('/api/admin/void-funds', async (c) => {
  const { caseId } = await c.req.json()
  const { error } = await getSupabase(c).from('cases').update({ stage2_status: 'voided', status: 'refunded' }).eq('id', caseId)
  if (error) return c.json({ error: error.message }, 500)
  return c.json({ status: 'success' })
})

export default app
