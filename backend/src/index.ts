import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createClient } from '@supabase/supabase-js'

type Bindings = { SUPABASE_URL: string; SUPABASE_SERVICE_KEY: string; PAYPAL_WEBHOOK_ID: string }
const app = new Hono<{ Bindings: Bindings }>()

app.use('/*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization'] }))

const getSupabase = (c: any) => createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_KEY)

app.get('/', (c) => c.text('Med-China API V1.0'))

// --- 用户接口 ---
app.post('/api/cases', async (c) => {
  const supabase = getSupabase(c); const body = await c.req.json()
  const { data: existing } = await supabase.from('cases').select('id').eq('user_email', body.email).eq('stage1_paid', false).maybeSingle()
  if (existing) {
    await supabase.from('cases').update({ symptoms: body.symptoms, target_city: body.city, target_hospital: body.hospital }).eq('id', existing.id)
    return c.json({ caseId: existing.id })
  }
//  const { data, error } = await supabase.from('cases').insert([{ 
//    user_email: body.email, patient_name: body.name, symptoms: body.symptoms, 
//    target_city: body.city, target_hospital: body.hospital 
//  }]).select().single()
//  return error ? c.json(error, 400) : c.json({ caseId: data.id })
  const { data, error } = await supabase
    .from('cases')
    .insert([{
      user_email: body.email,
      patient_name: body.name,
      symptoms: body.symptoms,
      target_city: body.city,
      target_hospital: body.hospital,
      passport_url: body.passport_url, // ⬅️ 存储图片链接
      status: 'draft'
    }])
    .select().single()

  if (error) return c.json({ error: error.message }, 400)
  return c.json({ caseId: data.id })
})

app.get('/api/cases/:id', async (c) => {
  const { data } = await getSupabase(c).from('cases').select('*').eq('id', c.req.param('id')).single()
  return data ? c.json(data) : c.json({ error: 'Not Found' }, 404)
})

app.post('/api/cases/:id/companion-details', async (c) => {
  const body = await c.req.json()
  await getSupabase(c).from('cases').update({ companion_request: body }).eq('id', c.req.param('id'))
  return c.json({ status: 'ok' })
})

// --- 管理员接口 (确认/扣款/退款) ---
app.get('/api/admin/all-cases', async (c) => {
  const { data } = await getSupabase(c).from('cases').select('*').order('created_at', { ascending: false })
  return c.json(data || [])
})

app.post('/api/admin/confirm-stage1', async (c) => {
  const { caseId } = await c.req.json()
  await getSupabase(c).from('cases').update({ stage1_paid: true, status: 'pending_stage2' }).eq('id', caseId)
  return c.json({ status: 'success' })
})

app.post('/api/admin/confirm-stage2', async (c) => {
  const { caseId, paypalAuthId } = await c.req.json()
  await getSupabase(c).from('cases').update({ stage2_status: 'authorized', stage2_auth_id: paypalAuthId, status: 'escrow_secured' }).eq('id', caseId)
  return c.json({ status: 'success' })
})

app.post('/api/admin/capture-stage2', async (c) => {
  const { caseId } = await c.req.json()
  await getSupabase(c).from('cases').update({ stage2_status: 'captured' }).eq('id', caseId)
  return c.json({ status: 'success' })
})

app.post('/api/admin/confirm-stage3', async (c) => {
  const { caseId } = await c.req.json()
  await getSupabase(c).from('cases').update({ stage3_status: 'paid' }).eq('id', caseId)
  return c.json({ status: 'success' })
})

// --- 在后端 index.ts 中添加这个接口 ---

// 用户完成 Stage 2 支付 (Escrow $100)
app.post('/api/cases/:id/stage2-complete', async (c) => {
  const id = c.req.param('id');
  const supabase = getSupabase(c);

  // 更新数据库状态为 'paid'
  const { error } = await supabase
    .from('cases') // 或者是 'applications'，看你的表名
    .update({ 
      stage2_status: 'paid', // 关键：设置为 paid
      stage2_txn_id: 'PAYPAL_CAPTURED' // 标记一下
    })
    .eq('id', id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// 在你的后端处理更新挂号凭证的接口中
//app.post('/api/cases/:id/stage2-complete', async (c) => {
//  const id = c.req.param('id');
//  const body = await c.req.json(); // 假设请求里带了凭证信息
//  const supabase = getSupabase(c);

//  const { error } = await supabase
//    .from('cases')
//    .update({ 
 //     stage2_status: 'paid', // ✅ 将状态设为 paid，界面会自动隐藏支付框
//      registration_voucher_id: body.voucher_id, // 存入医院给的凭证号
//      registration_image_url: body.image_url    // 存入凭证图片链接
//    })
//    .eq('id', id);

//  if (error) return c.json({ error: error.message }, 500);
//  return c.json({ success: true });
//});

// 后端 API: 接收管理员录入的凭证信息
app.post('/api/admin/cases/:id/verify', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json(); // 包含 voucher_id 和 image_url
  const supabase = getSupabase(c);

  const { error } = await supabase
    .from('cases')
    .update({ 
      stage2_status: 'paid', // 标记为已完成
      registration_voucher_id: body.voucher_id,
      registration_image_url: body.image_url
    })
    .eq('id', id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// 1. 确认支付已到账
app.post('/api/admin/cases/:id/confirm-payment', async (c) => {
    // 将状态从 authorized 改为 paid
    // 更新数据库: stage2_status = 'paid'
});

// 2. 录入挂号凭证
app.post('/api/admin/cases/:id/update-voucher', async (c) => {
    const { voucher_id } = await c.req.json();
    // 更新数据库: registration_voucher_id = voucher_id, stage2_status = 'confirmed'
});

// backend/src/index.ts 新增接口

// 通过邮箱查询用户最新的订单
app.get('/api/cases/lookup/:email', async (c) => {
  const supabase = getSupabase(c)
  const email = c.req.param('email')
  
  const { data, error } = await supabase
    .from('cases')
    .select('id, stage1_paid, status')
    .eq('user_email', email)
    .order('created_at', { ascending: false }) // 获取最近的一个
    .limit(1)
    .maybeSingle()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data || { noCase: true })
})

// 在后端现有接口中，增加这个“根据邮箱查询最新订单”的接口
app.get('/api/cases/user/:email', async (c) => {
  const supabase = getSupabase(c)
  const email = c.req.param('email')
  
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return c.json({ error: error.message }, 500)
  return c.json(data || { not_found: true })
})

// --- 1. 用户/前端获取所有城市和医院列表 ---
app.get('/api/meta/hospitals', async (c) => {
  const supabase = getSupabase(c)
  // 获取所有城市及其关联的医院
  const { data, error } = await supabase
    .from('dim_cities')
    .select(`
      name,
      dim_hospitals ( name )
    `)
  
  if (error) return c.json({ error: error.message }, 500)
  
  // 转换数据格式为前端容易处理的对象 { "Shanghai": ["Hospital A", "Hospital B"] }
  const formatted = data.reduce((acc: any, item: any) => {
    acc[item.name] = item.dim_hospitals.map((h: any) => h.name)
    return acc
  }, {})
  
  return c.json(formatted)
})

// --- 2. 管理员添加城市 ---
app.post('/api/admin/meta/cities', async (c) => {
  const { name } = await c.req.json()
  const { data, error } = await getSupabase(c).from('dim_cities').insert([{ name }]).select()
  return error ? c.json(error, 400) : c.json(data)
})

// --- 3. 管理员给特定城市添加医院 ---
app.post('/api/admin/meta/hospitals', async (c) => {
  const { cityName, hospitalName } = await c.req.json()
  const supabase = getSupabase(c)
  
  // 先找城市ID
  const { data: city } = await supabase.from('dim_cities').select('id').eq('name', cityName).single()
  if (!city) return c.json({ error: 'City not found' }, 404)
  
  const { error } = await supabase.from('dim_hospitals').insert([{ city_id: city.id, name: hospitalName }])
  return error ? c.json(error, 400) : c.json({ status: 'success' })
})

export default app
