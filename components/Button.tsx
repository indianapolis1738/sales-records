export default function Button({ label }: { label: string }) {
    return (
      <button className="bg-black text-white px-4 py-2 rounded-md text-sm">
        {label}
      </button>
    )
  }
  