const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Your secret API key
const VALID_KEY = 'MRINMOY';

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Format file size
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// ✅ Welcome
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ API: Get file info + links
app.get('/api', async (req, res) => {
  const { link, key } = req.query;

  if (!key) {
    return res.status(403).json({ error: "API key required. DM t.me/M_o_Y_zZz" });
  }
  if (key !== VALID_KEY) {
    return res.status(403).json({ error: "Invalid key. DM t.me/M_o_Y_zZz" });
  }
  if (!link) return res.status(400).json({ error: "Missing 'link' parameter" });

  const match = link.match(/\/s\/([^?]+)/);
  if (!match || !match[1]) {
    return res.status(400).json({ error: "Invalid TeraBox share link" });
  }

  const fileCode = match[1];

  try {
    const apiUrl = `https://www.terabox.com/share/list?app_id=250528&shorturl=${fileCode}&root=1`;
    const response = await axios.get(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const file = response.data?.list?.[0];
    if (!file) return res.status(404).json({ error: "File not found" });

    const extension = file.server_filename.split('.').pop();
    const thumb = file.thumbs?.url3 || file.thumbs?.url2 || file.thumbs?.url1 || null;

    const downloadLink = `https://d.pcs.baidu.com/file/${file.fs_id}?fid=${file.fs_id}&time=${Date.now()}&rt=sh&sign=static-sign&expires=9999999999&chk=hash`;

    res.json({
      name: file.server_filename,
      size: formatSize(file.size),
      extension,
      download: downloadLink,
      thumbnail: thumb,
      stream: `${req.protocol}://${req.get('host')}/stream?link=${encodeURIComponent(downloadLink)}&key=${key}`
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Stream Proxy
app.get('/stream', async (req, res) => {
  const { link, key } = req.query;

  if (!key || key !== VALID_KEY) {
    return res.status(403).json({ error: "Unauthorized stream. DM t.me/M_o_Y_zZz" });
  }

  if (!link) {
    return res.status(400).json({ error: "Missing 'link' parameter" });
  }

  try {
    const streamResponse = await axios({
      method: 'get',
      url: link,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'inline'
    });

    streamResponse.data.pipe(res);

  } catch (err) {
    console.error("Stream error:", err.message);
    res.status(500).json({ error: "Streaming failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
