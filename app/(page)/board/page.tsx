// page.tsx 또는 다른 컴포넌트에서

import SlateTextEditor from "../../components/SlateTextEditor";

export default function EditorPage() {
  return (
    <div className="w-full p-6 bg-gray-100 rounded-lg border">
      <h1 className="text-2xl font-bold mb-4">텍스트 에디터</h1>
      <SlateTextEditor />
    </div>
  )
}