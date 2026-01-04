export default function StatusBadge({ status }: { status: string }) {
    const colors: any = {
      Paid: "bg-green-100 text-green-700",
      "Part Payment": "bg-yellow-100 text-yellow-700",
      Unpaid: "bg-red-100 text-red-700",
    }
  
    return (
      <span className={`px-2 py-1 text-xs rounded ${colors[status]}`}>
        {status}
      </span>
    )
  }
  