function jsonResponse(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' }
  });
}

function toBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function normalizeProject(project) {
  return {
    title: String(project?.title || '').trim(),
    location: String(project?.location || '').trim(),
    bhk: String(project?.bhk || '').trim(),
    price: String(project?.price || '').trim(),
    status: String(project?.status || '').trim(),
    image: String(project?.image || '').trim(),
    whatsapp: String(project?.whatsapp || '').replace(/\D/g, ''),
    description: String(project?.description || '').trim(),
    bullets: Array.isArray(project?.bullets) ? project.bullets.map((item) => String(item).trim()).filter(Boolean) : []
  };
}

function validateProjects(projects) {
  if (!Array.isArray(projects)) throw new Error('projects must be an array');
  if (!projects.length) throw new Error('projects cannot be empty');

  return projects.map((project, index) => {
    const normalized = normalizeProject(project);
    for (const field of ['title', 'location', 'bhk', 'price', 'status', 'image', 'description']) {
      if (!normalized[field]) throw new Error(`Project ${index + 1} is missing ${field}`);
    }
    return normalized;
  });
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: { ...corsHeaders, 'Access-Control-Max-Age': '600' } });
    }

    if (request.method === 'GET') {
      return jsonResponse({ ok: true, service: 'clarity-project-publisher' }, 200, corsHeaders);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ ok: false, error: 'Method Not Allowed' }, 405, corsHeaders);
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400, corsHeaders);
    }

    const { adminKey } = body || {};
    if (!adminKey || adminKey !== env.ADMIN_KEY) {
      return jsonResponse({ ok: false, error: 'Unauthorized' }, 401, corsHeaders);
    }

    let projects;
    try {
      projects = validateProjects(body.projects);
    } catch (error) {
      return jsonResponse({ ok: false, error: error.message }, 400, corsHeaders);
    }

    const owner = env.REPO_OWNER;
    const repo = env.REPO_NAME;
    const path = env.FILE_PATH || 'projects.json';
    const branch = env.BRANCH || 'main';
    const token = env.GITHUB_TOKEN;
    const missingConfig = [];
    if (!owner) missingConfig.push('REPO_OWNER');
    if (!repo) missingConfig.push('REPO_NAME');
    if (!token) missingConfig.push('GITHUB_TOKEN');
    if (missingConfig.length) {
      return jsonResponse({ ok: false, error: 'Server misconfigured', missing: missingConfig }, 500, corsHeaders);
    }

    const githubHeaders = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'clarity-estates-project-publisher',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`;
    const getRes = await fetch(getUrl, { headers: githubHeaders });
    let sha;
    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
    } else if (getRes.status !== 404) {
      const text = await getRes.text();
      return jsonResponse({ ok: false, error: 'GitHub read error', githubStatus: getRes.status, detail: text }, 502, corsHeaders);
    }

    const content = `${JSON.stringify(projects, null, 2)}\n`;
    const putBody = {
      message: env.COMMIT_MESSAGE || 'Update projects.json from site admin',
      content: toBase64Utf8(content),
      branch
    };
    if (sha) putBody.sha = sha;

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
    const putRes = await fetch(putUrl, { method: 'PUT', headers: githubHeaders, body: JSON.stringify(putBody) });
    const putJson = await putRes.json();
    if (!putRes.ok) {
      return jsonResponse({ ok: false, error: 'GitHub write error', githubStatus: putRes.status, detail: putJson }, 502, corsHeaders);
    }

    return jsonResponse({ ok: true, commit: putJson.commit?.sha, url: putJson.content?.html_url }, 200, corsHeaders);
  }
};

