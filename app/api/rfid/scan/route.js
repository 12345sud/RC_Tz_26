import { handleScanPost, handleScanGet } from '@/lib/scanHandler';

export async function POST(request) {
  return handleScanPost(request);
}

export async function GET(request) {
  return handleScanGet(request);
}
