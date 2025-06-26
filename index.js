const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

app.get('/', (req, res) => {
  res.send("🎉 TeraBox API Working. Use /api?link=<share_link>");
});

app.get('/api', async (req, res) => {
  const { link } = req.query;
  if (!link) return res.status(400).json({ error: "Missing link parameter" });

  try {
    const fileCode = link.split("/s/")[1].split("?")[0];
    const apiUrl = https://www.terabox.com/share/list?app_id=250528&shorturl=${fileCode}&root=1;

    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const file = response.data?.list?.[0];
    if (!file) return res.status(404).json({ error: "File not found" });

    const extension = file.server_filename.split('.').pop();
    const thumb = file.thumbs?.url3  file.thumbs?.url2  file.thumbs?.url1 || null;

    const downloadLink = https://d.pcs.baidu.com/file/${file.fs_id}?fid=${file.fs_id}&time=${Date.now()}&rt=sh&sign=static-sign&expires=9999999999&chk=hash;

    res.json({
      name: file.server_filename,
      size: formatSize(file.size),
      extension: extension,
      download: downloadLink,
      thumbnail: thumb
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(🚀 Server running on port ${PORT});
});
