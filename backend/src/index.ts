import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_SERVICE_KEY: string
  PAYPAL_WEBHOOK_ID: string
}

const app = new Hono<{ Bindings: Bindings }>()

// 1. 允许跨域
//app.use('/*', cors({ origin: '*' }))
// 文件路径: backend/src/index.ts

// 找到 app.use 的地方，把 cors 配置改成下面这样：
app.use('/*', cors({
  // 生产环境应该精确到前端地址，但在 MVP 阶段，
  // 我们需要确保 PayPal 能进来，所以先用 * 兜底
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  // 必须明确允许 POST 方法，特别是针对 Webhook
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  maxAge: 600,
  credentials: true,
}))

// 工具：获取数据库连接
const getSupabase = (c: any) => createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY)

// --- API 接口 ---

// 创建新 Case (Stage 1 前)
app.post('/api/cases', async (c) => {
  const supabase = getSupabase(c)
  const body = await c.req.json()
  
  const { data, error } = await supabase
    .from('cases')
    .insert([{
      user_email: body.email,
      patient_name: body.name,
      symptoms: body.symptoms,
      target_city: body.city,
      status: 'draft' // 初始状态
    }])
    .select()
    .single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ caseId: data.id })
})

// 获取 Case 详情 (用于前端 Dashboard)
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

// --- Webhook 核心逻辑 (PayPal 通知) ---
app.post('/api/webhooks/paypal', async (c) => {
  const supabase = getSupabase(c)
  const body = await c.req.json()
  const eventType = body.event_type
  const resource = body.resource

  console.log(`Webhook Received: ${eventType}`)

  // 记录日志
  await supabase.from('webhook_logs').insert({ event_type: eventType, payload: body })

  // 解析 Custom ID (格式: "CASE_UUID:STAGE_X")
  // 前端支付时必须传这个参数
  const customId = resource.custom_id || resource.purchase_units?.[0]?.custom_id
  if (!customId) return c.json({ ignored: true })

  const [caseId, stage] = customId.split(':')

  // 1. 处理 Stage 1 & 3 直接收款成功 (CAPTURE.COMPLETED)
  if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
    if (stage === 'stage_1') {
      await supabase.from('cases').update({
        stage1_paid: true,
        stage1_txn_id: resource.id,
        status: 'pending_stage2' // 变为待挂号状态
      }).eq('id', caseId)
    } 
    else if (stage === 'stage_3') {
      await supabase.from('cases').update({
        stage3_status: 'paid',
        stage3_txn_id: resource.id,
        companion_assigned: false // 标记为需要分配陪诊
      }).eq('id', caseId)
    }
  }

  // 2. 处理 Stage 2 托管/预授权成功 (AUTHORIZATION.CREATED)
  // 钱被冻结，但还没划走
  if (eventType === 'PAYMENT.AUTHORIZATION.CREATED' && stage === 'stage_2') {
    await supabase.from('cases').update({
      stage2_status: 'authorized',
      stage2_auth_id: resource.id,
      status: 'escrow_secured' // 标记为资金已托管，你可以开始挂号了
    }).eq('id', caseId)
  }

  // 3. 处理 Stage 2 退款/取消授权 (AUTHORIZATION.VOIDED)
  if (eventType === 'PAYMENT.AUTHORIZATION.VOIDED' && stage === 'stage_2') {
    await supabase.from('cases').update({
      stage2_status: 'voided',
      status: 'refunded'
    }).eq('id', caseId)
  }

  return c.json({ status: 'ok' })
})

export default app
