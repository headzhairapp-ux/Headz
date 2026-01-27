-- Create generated_images table
CREATE TABLE generated_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read generated images
CREATE POLICY "Allow public read access" ON generated_images
FOR SELECT USING (true);

-- Allow anyone to insert new generated images
CREATE POLICY "Allow public insert access" ON generated_images
FOR INSERT WITH CHECK (true);

-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public) VALUES ('generated-images', 'generated-images', true);

-- Allow public access to generated-images bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'generated-images');

-- Allow public uploads to generated-images bucket
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'generated-images');
