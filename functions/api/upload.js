export async function onRequest(context) {
  const { request, env } = context;

  // OPTIONS: CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // GET: Retrieve uploaded report from Cloudflare REPORT_KV
  if (request.method === 'GET') {
    if (env.REPORT_KV) {
      try {
        const kvData = await env.REPORT_KV.get('LATEST_REPORT', 'json');
        if (kvData && kvData.csList) {
          return new Response(JSON.stringify(kvData), {
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-cache'
            }
          });
        }
      } catch (e) {
        console.error('KV get error:', e);
      }
    }
    return new Response(JSON.stringify({ status: 'no_data' }), { status: 404 });
  }

  // POST: Save uploaded report to Cloudflare REPORT_KV
  if (request.method === 'POST') {
    try {
      const data = await request.json();
      const reportObj = data.reportData || data;
      if (reportObj && reportObj.csList) {
        if (env.REPORT_KV) {
          await env.REPORT_KV.put('LATEST_REPORT', JSON.stringify(reportObj));
          console.log('✅ Synced uploaded report to Cloudflare REPORT_KV successfully');
        }
        return new Response(JSON.stringify({ ok: true, message: 'Uploaded report synced to Cloudflare KV' }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error: err.message }), { status: 400 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
}
