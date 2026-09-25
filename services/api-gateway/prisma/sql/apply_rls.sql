-- Enforce RLS on FeatureFlag to allow public read access for the frontend hook
ALTER TABLE "FeatureFlag" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to all users"
ON "FeatureFlag"
FOR SELECT
USING (true);

-- Since Prisma (backend) connects via service role, it bypasses RLS and can write to FeatureFlag.
-- Other tables (User, Session, DoctorRequest) are not accessed directly by the frontend Supabase JS client,
-- and are protected by the Express backend authentication middleware.
