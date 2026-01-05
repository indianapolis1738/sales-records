export default function Card({ title, value }: { title: string; value: string }) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold mt-2">{value}</p>
      </div>
    )
  }
  