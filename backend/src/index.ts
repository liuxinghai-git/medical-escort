import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

// 定义环境变量类型
type Bindings = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  PAYPAL_WEBHOOK_ID: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 1. 全局 CORS 配置 (修复跨域和 Webhook 接收问题)
app.use('/*', cors({
  origin: '*', // 允许所有来源 (MVP阶段)
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
}))

// 工具函数：初始化 Supabase 客户端
const getSupabase = (c: any) => {
  return createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY)
}

// 健康检查
app.get('/', (c) => c.text('Med-China API is Running (Cloudflare Workers)'))

/**
 * ==========================================
 * 用户端 API (Client Side)
 * ==========================================
 */

// 1. 创建/更新 Case (带查重逻辑)
app.post('/api/cases', async (c) => {
  const supabase = getSupabase(c)
  const body = await c.req.json()
  
  // 查重：检查是否有未支付的草稿
  const { data: existingCase } = await supabase
    .from('cases')
    .select('id')
    .eq('user_email', body.email)
    .eq('stage1_paid', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingCase) {
    // 复用旧草稿，更新信息
    await supabase.from('cases').update({
        patient_name: body.name,
        symptoms: body.symptoms,
        target_city: body.city,
        target_hospital: body.hospital
    }).eq('id', existingCase.id);

    return c.json({ caseId: existingCase.id, message: 'Resumed existing draft' })
  }

  // 创建新 Case
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
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ caseId: data.id })
})

// 2. 获取 Case 详情
app.get('/api/cases/:id', async (c) => {
  const supabase = getSupabase(c)
  const id = c.req.param('id')
  
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return c.json({ error: 'Not found' }, 404)
  return c.json(data)
})

/**
 * ==========================================
 * Webhook 核心逻辑 (PayPal 通知)
 * ==========================================
 */
app.post('/api/webhooks/paypal', async (c) => {
  const supabase = getSupabase(c)
  
  // 1. 获取 PayPal 数据
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.text('Invalid JSON', 400);
  }

  const eventType = body.event_type
  const resource = body.resource

  console.log(`Webhook Received: ${eventType}`)

  // 2. 存入日志表 (用于排查问题)
  await supabase.from('webhook_logs').insert({
    event_type: eventType,
    payload: body
  })

  // 3. 处理不同类型的事件
  const customId = resource.custom_id;

  // A. Stage 1: 即时支付成功 (PAYMENT.CAPTURE.COMPLETED)
  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    if (customId && customId.includes(':stage_1')) {
      const caseId = customId.split(':')[0]
      
      console.log(`Stage 1 Paid for Case: ${caseId}`)

      await supabase.from('cases')
        .update({
          stage1_paid: true,
          stage1_txn_id: resource.id,
          status: 'pending_stage2',
          current_stage: 1
        })
        .eq('id', caseId)
    }
    // 处理 Stage 2 的 Capture (管理员点击收款)
    else if (customId && customId.includes(':stage_2')) {
        const caseId = customId.split(':')[0]
        console.log(`Stage 2 Funds Captured for Case: ${caseId}`)
        await supabase.from('cases')
          .update({ stage2_status: 'captured', status: 'completed' })
          .eq('id', caseId)
    }
  }

  // B. Stage 2: 托管/授权成功 (PAYMENT.AUTHORIZATION.CREATED)
  // 用户钱被冻结，此时管理员应该看到操作按钮
  if (eventType === 'PAYMENT.AUTHORIZATION.CREATED') {
    if (customId && customId.includes(':stage_2')) {
      const caseId = customId.split(':')[0]
      
      console.log(`Stage 2 Authorized for Case: ${caseId}`)

      await supabase.from('cases')
        .update({
          stage2_status: 'authorized',
          stage2_auth_id: resource.id,
          status: 'escrow_secured'
        })
        .eq('id', caseId)
    }
  }

  // C. Stage 2: 退款/取消授权 (PAYMENT.AUTHORIZATION.VOIDED)
  if (eventType === 'PAYMENT.AUTHORIZATION.VOIDED') {
    if (customId && customId.includes(':stage_2')) {
      const caseId = customId.split(':')[0]
      
      console.log(`Stage 2 Voided for Case: ${caseId}`)

      await supabase.from('cases')
        .update({ 
          stage2_status: 'voided',
          status: 'refunded'
        })
        .eq('id', caseId)
    }
  }

  return c.json({ received: true })
})

/**
 * ==========================================
 * 管理员 API (Admin Ops)
 * ==========================================
 */

// 1. 获取所有订单
app.get('/api/admin/all-cases', async (c) => {
  const supabase = getSupabase(c)
  
  // 这里可以加简单的 Header Token 验证
  // const token = c.req.header('Authorization') ...

  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data)
})

// 2. 释放资金 (Capture) - 仅更新数据库状态
// 真实环境这里应该调用 PayPal API，现在假设管理员已经在 PayPal 后台操作了
app.post('/api/admin/release-funds', async (c) => {
  const supabase = getSupabase(c)
  const { caseId } = await c.req.json()

  // 假设管理员已经在 PayPal 点击了 Capture
  // 我们手动更新数据库状态，以防 Webhook 延迟
  const { error } = await supabase
    .from('cases')
    .update({ stage2_status: 'captured' })
    .eq('id', caseId)

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ status: 'success', message: 'Marked as Captured' })
})

// 3. 退款 (Void) - 仅更新数据库状态
app.post('/api/admin/void-funds', async (c) => {
  const supabase = getSupabase(c)
  const { caseId } = await c.req.json()

  const { error } = await supabase
    .from('cases')
    .update({ stage2_status: 'voided' })
    .eq('id', caseId)

  if (error) return c.json({ error: error.message }, 500)
  return c.json({ status: 'success', message: 'Marked as Voided' })
})

export default app
