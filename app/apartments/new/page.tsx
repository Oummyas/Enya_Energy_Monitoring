import Link from "next/link";
import { ApartmentForm } from "../apartment-form";
import { createApartment } from "../actions";

export default function NewApartmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/apartments" className="text-sm hover:underline">
        ← Back to apartments
      </Link>
      <h1 className="font-bold text-2xl">New apartment</h1>
      <ApartmentForm action={createApartment} submitLabel="Create apartment" />
    </div>
  );
}
