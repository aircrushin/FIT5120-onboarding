'use client'

import { useState } from "react"
import { insertIngredientsFromCSV, insertHoldersFromCSV, insertProductsFromCSV, insertProdIngredientsFromCSV } from "db/queries/insert";
import { clearTables } from "db/queries/delete";

export default function TestingPage() {
  const [test, setTest] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleResult = async () => {
    if (!test.trim()) {
      setResult("Please enter a holder ID");
      return;
    }

    const holderId = parseInt(test, 10);
    if (isNaN(holderId)) {
      setResult("Please enter a valid number");
      return;
    }

    setLoading(true);
    try {
      // Note: This won't work in client components due to database connection
      // You'll need to create an API route instead
      const response = await fetch(`/api/holders/${holderId}`);
      if (response.ok) {
        const holder = await response.json();
        setResult(holder ? `Found: ${holder.holder_name}` : "Holder not found");
      } else {
        setResult("Error fetching holder");
      }
    } catch (error) {
      console.error("Error:", error);
      setResult("Error occurred while fetching holder");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <input 
          value={test}
          onChange={(e) => setTest(e.target.value)}
          placeholder="Enter holder ID..."
          className="border border-gray-300 rounded px-3 py-2 mr-2"
        />
        <button 
          onClick={handleResult}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Loading..." : "Get Holder"}
        </button>
      </div>
      {result && (
        <p className="mt-4 p-3 bg-gray-100 rounded">
          {result}
        </p>
      )}
      <button onClick={() => insertProdIngredientsFromCSV()}>test insert</button>
    </div>
  )
}