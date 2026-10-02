-- Drop the restrictive upload policy
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;

-- Create a permissive upload policy that allows anyone to upload
CREATE POLICY "Anyone can upload receipts"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'receipts');