import { useState } from "react";
import * as XLSX from "xlsx";

export default function BulkUpload() {
  const [fileData, setFileData] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      // Preview the first 10 rows
      setPreviewData(data.slice(0, 10));
      setFileData(data);
    };
    reader.readAsBinaryString(file);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5050/bulk/', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fileData),
      });
      console.log("ndfd");
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      alert("Records uploaded successfully!");
      setFileData([]);
      setPreviewData([]);
      console.log("jhda");
    } catch (error) {
      console.error("Failed to upload records: ", error);
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Bulk Upload Employee Records</h3>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
        className="mb-4"
      />
      {previewData.length > 0 && (
        <div>
          <h4 className="font-semibold">Preview of Uploaded Data (First 10 Rows):</h4>
          <table className="min-w-full bg-white border border-gray-200 mt-2">
            <thead>
              <tr>
                {Object.keys(previewData[0]).map((key) => (
                  <th key={key} className="py-2 px-4 border">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="py-2 px-4 border">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Confirm and Upload
          </button>
        </div>
      )}
    </div>
  );
}
