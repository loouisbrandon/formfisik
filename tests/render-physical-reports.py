"""Local QA only: render actual PDFKit outputs using Poppler and inspect text bounds."""
from pathlib import Path
import subprocess,json,os
import pdfplumber
base=Path(os.environ.get('TEST_ARTIFACT_ROOT','test-results/current'))
root=base/'014/pdf-renders';root.mkdir(parents=True,exist_ok=True)
results=[]
for pdf in sorted((base/'output/pdf/014').glob('*.pdf')):
 out=root/pdf.stem;out.mkdir(exist_ok=True)
 subprocess.run(['pdftoppm','-r','90','-png',str(pdf),str(out/'page')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 with pdfplumber.open(pdf) as document:
  issues=[]
  for i,page in enumerate(document.pages,1):
   assert abs(page.width-595.28)<1 and abs(page.height-841.89)<1
   words=page.extract_words()
   for w in words:
    if w['x0']<40 or w['x1']>555 or w['top']<25 or w['bottom']>825:issues.append({'page':i,'word':w['text'],'bbox':[w['x0'],w['top'],w['x1'],w['bottom']]})
   text=page.extract_text() or ''
   assert 'Produzido com FormFisik' in text,(pdf,i)
   assert f'{i} / {len(document.pages)}' in text,(pdf,i)
  results.append({'file':str(pdf),'pages':len(document.pages),'bytes':pdf.stat().st_size,'issues':issues})
  subprocess.run(['pdftoppm','-f','1','-singlefile','-gray','-r','90','-png',str(pdf),str(out/'grayscale')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
(base/'014/pdf-inspection.json').write_text(json.dumps(results,indent=2,ensure_ascii=False))
print(json.dumps(results,indent=2,ensure_ascii=False))
assert not any(r['issues'] for r in results)
assert len(results)==11
