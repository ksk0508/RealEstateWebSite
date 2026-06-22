export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', {status:405});
    let body;
    try { body = await request.json(); } catch (e) { return new Response('Invalid JSON', {status:400}); }
    const { adminKey, projects } = body || {};
    if (!adminKey || adminKey !== env.ADMIN_KEY) return new Response('Unauthorized', {status:401});

    const owner = env.REPO_OWNER;
    const repo = env.REPO_NAME;
    const path = env.FILE_PATH || 'projects.json';
    const branch = env.BRANCH || 'main';
    const token = env.GITHUB_TOKEN;
    if (!owner || !repo || !token) return new Response('Server misconfigured', {status:500});

    // Get existing file to obtain sha (if it exists)
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const headers = { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' };
    const getRes = await fetch(getUrl, { headers });
    let sha;
    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
    } else if (getRes.status === 404) {
      sha = undefined;
    } else {
      const txt = await getRes.text();
      return new Response('GitHub read error: ' + txt, {status:500});
    }

    const contentB64 = btoa(typeof projects === 'string' ? projects : JSON.stringify(projects, null, 2));
    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const putBody = {
      message: env.COMMIT_MESSAGE || 'Update projects.json via Cloudflare Worker',
      content: contentB64,
      branch: branch
    };
    if (sha) putBody.sha = sha;

    const putRes = await fetch(putUrl, { method: 'PUT', headers, body: JSON.stringify(putBody) });
    const putJson = await putRes.json();
    const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
    if (putRes.ok) return new Response(JSON.stringify({ ok: true, result: putJson }), { status: 200, headers: corsHeaders });
    return new Response(JSON.stringify({ ok: false, error: putJson }), { status: 500, headers: corsHeaders });
  }
};
