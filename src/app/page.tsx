import DataTable from "./components/TableComponent";

import { Poppins } from 'next/font/google';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600'] });

export default function Home() {
  return (
    <div className={`container mx-auto p-4 ${poppins.className}`}>
      <h1 className="text-3xl font-bold mb-4 pt-[100px]">User Records Table</h1>
      <p className="text-gray-600 mb-4 pb-[100px]">
       Information about a user, including name, email, and start date, inviter, status and available actions.
      </p>

      <DataTable />
    </div>
  );
}
