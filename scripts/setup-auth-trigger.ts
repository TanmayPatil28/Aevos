import { prisma } from '../lib/prisma';

async function main() {
  console.log("Creating Supabase Auth Trigger...");

  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      INSERT INTO public.users (id, email, name, "createdAt")
      VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'full_name',
        now()
      )
      ON CONFLICT (email) DO NOTHING;
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
  `);

  console.log("Trigger created successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
