import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx"; // Import xlsx library

const Record = ({ record, handleCheckboxChange, isSelected }) => (
  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => handleCheckboxChange(record._id)}
      />
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {record.name}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {record.position}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      {record.level}
    </td>
    <td className="p-4 align-middle [&amp;:has([role=checkbox])]:pr-0">
      <div className="flex gap-2">
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 h-9 rounded-md px-3"
          to={`/edit/${record._id}`}
        >
          Edit
        </Link>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3"
          color="red"
          type="button"
          onClick={() => handleCheckboxChange(record._id)}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [excelData, setExcelData] = useState([]); // State to store Excel data
  const [previewData, setPreviewData] = useState([]); // State to store preview data

  const getRecords = async () => {
    const response = await fetch("http://localhost:5050/record/");
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      console.error(message);
      return;
    }
    const records = await response.json();
    setRecords(records);
  };

  useEffect(() => {
    getRecords();
  }, []);
  const handleCheckboxChange = (id) => {
    if (selectedRecords.includes(id)) {
      setSelectedRecords(selectedRecords.filter((recordId) => recordId !== id));
    } else {
      setSelectedRecords([...selectedRecords, id]);
    }
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map((record) => record._id));
    }
    setSelectAll(!selectAll);
  };

  const handleFilterChange = (level) => {
    if (selectedFilters.includes(level)) {
      setSelectedFilters(selectedFilters.filter((filter) => filter !== level));
    } else {
      setSelectedFilters([...selectedFilters, level]);
    }
  };

  async function deleteSelectedRecords() {
    for (let id of selectedRecords) {
      await fetch(`http://localhost:5050/record/${id}`, {
        method: "DELETE",
      });
    }
    const newRecords = records.filter((record) => !selectedRecords.includes(record._id));
    setRecords(newRecords);
    setSelectedRecords([]);
    setSelectAll(false);
  }


  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(jsonData);
      setPreviewData(jsonData.slice(0, 10)); // Preview first 10 rows
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmUpload = async () => {
    for (let record of excelData) {
      await fetch("http://localhost:5050/record/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });
    }
    setExcelData([]);
    setPreviewData([]);
    getRecords(); // Refresh the records after insertion
  };

  const filteredRecords = () => {
    const recordsAfterFilter = selectedFilters.length
      ? records.filter((record) => selectedFilters.includes(record.level))
      : records;

    return recordsAfterFilter.filter((record) =>
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <>
      <h3 className="text-lg font-semibold p-4">Employee Records</h3>

      {/* Search Box */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search by name or position"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      {/* Upload Button for Excel File */}
      <div className="p-4">
        <h4 className="block text-sm font-medium leading-6 text-slate-900 mb-2">
          Upload Excel File
        </h4>
        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </div>

      {/* Preview of Excel Data */}
      {previewData.length > 0 && (
        <div className="p-4">
          <h4 className="block text-sm font-medium leading-6 text-slate-900 mb-2">
            Preview Data (First 10 Rows)
          </h4>
          <table className="w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                {Object.keys(previewData[0]).map((key) => (
                  <th key={key} className="border border-gray-400 p-2">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="border border-gray-400 p-2">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleConfirmUpload}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Confirm Upload
          </button>
        </div>
      )}

      {/* Filter Checkboxes */}
      <div className="p-4">
        <h4 className="block text-sm font-medium leading-6 text-slate-900 mb-2">Filter by Level</h4>
        <div className="flex gap-4">
          {["Intern", "Junior", "Senior"].map((level) => (
            <label key={level} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedFilters.includes(level)}
                onChange={() => handleFilterChange(level)}
                className="mr-2"
              />
              {level}
            </label>
          ))}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&amp;_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                  />
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Position
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Level
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&amp;:has([role=checkbox])]:pr-0">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&amp;_tr:last-child]:border-0">
              {filteredRecords().map((record) => (
                <Record
                  record={record}
                  isSelected={selectedRecords.includes(record._id)}
                  handleCheckboxChange={handleCheckboxChange}
                  key={record._id}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <button
            onClick={deleteSelectedRecords}
            className="inline-flex items-center justify-center whitespace-nowrap text-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-slate-100 hover:text-accent-foreground h-9 rounded-md px-3 cursor-pointer mt-4"
          >
            Delete Selected
          </button>
        </div>
      </div>
    </>
  );
}
