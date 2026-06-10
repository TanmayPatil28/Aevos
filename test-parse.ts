import { prisma } from './lib/prisma';
import * as mammoth from 'mammoth';
import crypto from 'crypto';

async function run() {
  const doc = await prisma.document.findFirst({
    where: { fileName: { endsWith: '.docx' } },
    orderBy: { createdAt: 'desc' }
  });
  if (!doc) { console.log('No docx found'); return; }
  console.log('Found doc:', doc.fileName);
  
  const response = await fetch(doc.fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  console.log('File URL:', doc.fileUrl);
  console.log('Response status:', response.status);
  console.log('Response text preview:', buffer.toString('utf-8').substring(0, 200));
  
  try {
    const result = await mammoth.extractRawText({ buffer });
    console.log('Mammoth success. Text length:', result.value.length);
    console.log('UUID test:', crypto.randomUUID());
  } catch (err) {
    console.error('Mammoth error:', err);
  }
}
run().finally(() => prisma.$disconnect());
