import { POST } from '../../../app/api/parse/resume/route';
import { NextRequest } from 'next/server';

// We need to mock supabase createClient
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    }
  })
}));

async function run() {
  // Test 1: File > 5MB
  const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
  const largeFile = new File([largeBuffer], 'large.pdf', { type: 'application/pdf' });
  const formDataLarge = new FormData();
  formDataLarge.append('file', largeFile);
  
  const reqLarge = new Request('http://localhost/api/parse/resume', {
    method: 'POST',
    body: formDataLarge
  });
  
  const resLarge = await POST(reqLarge);
  console.log('Large File Status:', resLarge.status);
  console.log('Large File Body:', await resLarge.json());
  
  // Test 2: Invalid type
  const badTypeBuffer = Buffer.alloc(1024);
  const badTypeFile = new File([badTypeBuffer], 'image.png', { type: 'image/png' });
  const formDataBad = new FormData();
  formDataBad.append('file', badTypeFile);
  
  const reqBad = new Request('http://localhost/api/parse/resume', {
    method: 'POST',
    body: formDataBad
  });
  
  const resBad = await POST(reqBad);
  console.log('Bad Type Status:', resBad.status);
  console.log('Bad Type Body:', await resBad.json());
}

run().catch(console.error);
