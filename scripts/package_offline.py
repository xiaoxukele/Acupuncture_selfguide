"""Package the already-built static site; recipients need only a browser."""
from pathlib import Path
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
VERSION = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))['version']
OUTPUT = ROOT / 'releases' / f'Acupuncture_selfguide-offline-{VERSION}.zip'
INSTRUCTIONS = '''经穴：身体与耳穴学习图谱（离线版）

打开方式
1. 将整个压缩包解压到一个文件夹。不要在压缩包预览窗口内直接打开。
2. 进入 Acupuncture_selfguide 文件夹，双击“打开网页.html”或 index.html。
3. 使用电脑上的新版 Chrome、Edge、Firefox 或 Safari 浏览器打开。

无需安装 Node.js、Python 或其他软件，无需启动服务器，无需登录。
请保留 assets 文件夹、app.js 和 styles.css 与网页的相对位置。
可将整个文件夹复制到另一台电脑，或者直接转发原始 ZIP 压缩包。

离线可用：搜索病痛/穴名/编码、按部位筛选、人体正背面与耳部切换、
图上点选、缩放、病痛索引、收藏、主题切换、来源说明和数据/图片下载。
原始文献的外部网站链接需要联网才能访问。

收藏与主题保存在当前浏览器中，不会随压缩包自动转给他人。
浏览器可能限制 file:// 页面存储，或在移动文件夹后不保留收藏；
这不影响查阅与搜索。优先使用电脑浏览器；手机系统可能限制本地网页脚本。

医疗内容说明
这是待专业复核的学习原型，并非完整标准穴位图谱。
全部图示仅为部位索引示意，不可用于诊断、实际取穴或自行针刺。
针灸应由合格专业人员操作，急症请及时就医。

SHA256SUMS.txt 提供本包各文件的 SHA-256 校验值。
'''

def main():
    assert (DIST / 'index.html').is_file(), 'Run npm run build first'
    payload = {p.relative_to(DIST).as_posix(): p.read_bytes()
               for p in sorted(DIST.rglob('*')) if p.is_file()}
    payload['打开网页.html'] = payload['index.html']
    payload['使用说明.txt'] = INSTRUCTIONS.encode('utf-8-sig')
    payload['SHA256SUMS.txt'] = ('\n'.join(
        f'{hashlib.sha256(data).hexdigest()}  {name}'
        for name, data in sorted(payload.items())) + '\n').encode('utf-8')
    OUTPUT.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(OUTPUT, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for name, data in sorted(payload.items()):
            entry = zipfile.ZipInfo('Acupuncture_selfguide/' + name, (2026, 11, 16, 0, 0, 0))
            entry.compress_type = zipfile.ZIP_DEFLATED
            entry.external_attr = 0o100644 << 16
            z.writestr(entry, data)
    with zipfile.ZipFile(OUTPUT) as z:
        assert z.testzip() is None
    print(json.dumps({'archive': str(OUTPUT), 'files': len(payload),
                      'bytes': OUTPUT.stat().st_size,
                      'sha256': hashlib.sha256(OUTPUT.read_bytes()).hexdigest()}, ensure_ascii=False))

if __name__ == '__main__':
    main()
