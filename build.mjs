import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(root, 'source-data');
const dist = path.join(root, 'dist');
fs.mkdirSync(path.join(dist, 'assets'), {recursive:true});
const read = n => JSON.parse(fs.readFileSync(path.join(source,n), 'utf8'));
const body = fs.readFileSync(path.join(source,'images/body-acupoints.svg'),'utf8');
const ear = fs.readFileSync(path.join(source,'images/ear-acupoints.svg'),'utf8');
// Smooth the head contour for the web illustration without changing draft point coordinates.
const outline = body.match(/<path d="([^"]+)" class="contour"/)[1]
 .replace('M -24 96 C -68 91 -76 122 -65 156 C -62 174 -50 187 -31 194 L -31 224', 'M -24 96 C -47 96 -55 116 -51 141 C -48 165 -39 183 -26 194 L -26 224')
 .replace('31 224 L 31 194 C 50 187 62 174 65 156 C 76 122 68 91 24 96 Q 0 84 -24 96 Z', '26 224 L 26 194 C 39 183 48 165 51 141 C 55 116 47 96 24 96 Q 0 87 -24 96 Z');
const earPaths = [...ear.matchAll(/<path class="(contour|line)" d="([^"]+)"\s*\/>/g)].map(m=>({class:m[1],d:m[2]}));
fs.writeFileSync(path.join(dist,'assets/data.js'), 'window.ATLAS_DATA = '+JSON.stringify({conditions:read('conditions.json'),points:read('points.json'),sources:read('sources.json'),outline,earPaths})+';');
for (const name of ['body-acupoints.svg','ear-acupoints.svg']) fs.copyFileSync(path.join(source,'images',name),path.join(dist,'assets',name));
for (const name of ['conditions.csv','conditions.json','points.json','sources.json']) fs.copyFileSync(path.join(source,name),path.join(dist,'assets',name));
const iconRoot=fs.existsSync(path.join(root,'node_modules/@phosphor-icons/web'))?path.join(root,'node_modules/@phosphor-icons/web'):path.resolve(root,'../node_modules/@phosphor-icons/web');
for(const name of ['style.css','Phosphor.woff2','Phosphor.woff','Phosphor.ttf','Phosphor.svg']) {
 const from=path.join(iconRoot,'src/regular',name); if(fs.existsSync(from))fs.copyFileSync(from,path.join(dist,'assets',name));
}
console.log('Built static atlas: 14 conditions, 58 point entries.');
