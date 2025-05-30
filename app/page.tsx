import { auth } from "@clerk/nextjs/server";
import ClientLandingPage from "./ClientLandingPage";

export default async function Home() {
  const { userId } = await auth();
  
  return <ClientLandingPage userId={userId} />;
}
