import React from 'react';

const Table = ({ columns, data, onSort, sortColumn }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                className="py-2 px-4 border-b border-gray-200 text-left text-sm font-semibold text-gray-700 cursor-pointer"
                onClick={() => onSort(column.accessor)}
              >
                {column.label}
                {sortColumn === column.accessor && (
                  <span className="ml-2">
                    {column.isSortedAsc ? '▲' : '▼'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-100">
              {columns.map((column) => (
                <td key={column.accessor} className="py-2 px-4 border-b border-gray-200 text-sm text-gray-600">
                  {row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;