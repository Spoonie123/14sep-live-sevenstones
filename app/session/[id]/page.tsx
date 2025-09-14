import { redirect } from "next/navigation";

type Props = { params: { id: string } };

export default function Page({ params }: Props) {
  // bezoek /session/[id] -> redirect naar personality tab
  redirect(`/session/${params.id}/personality`);
}
