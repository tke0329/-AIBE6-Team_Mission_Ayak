import { LoginPage } from "@/components/login-page";

type SearchParams = Promise<{ next?: string; joined?: string }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  return <LoginPage nextPath={searchParams.next} joined={searchParams.joined === "1"} />;
}
