import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { receiptPath } from '@/lib/ids';

/** Shows a private receipt through a short-lived signed link (staff only). */
const ReceiptImage = ({ value, className }: { value: string; className?: string }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setUrl(null);
    supabase.storage
      .from('receipts')
      .createSignedUrl(receiptPath(value), 600)
      .then(({ data }) => {
        if (active) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      active = false;
    };
  }, [value]);

  if (!url) return <div className="h-40 w-full animate-pulse bg-muted" />;
  return <img src={url} alt="Receipt" className={className} />;
};

export default ReceiptImage;
