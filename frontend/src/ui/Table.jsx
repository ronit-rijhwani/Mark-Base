import React from 'react'

/**
 * Simple table wrapper with loading + empty states.
 * For complex tables (sorting, selection), extend via props rather than inline styles in pages.
 */
export default function Table({
  columns,
  rows,
  rowKey = (r, i) => i,
  emptyText = 'No records found.',
  loading = false,
  caption,
}) {
  return (
    <div className="table-responsive" role="region" aria-label={caption || 'Table'}>
      <table className="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '18px', textAlign: 'center' }}>
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '18px', textAlign: 'center' }}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={rowKey(r, i)}>
                {columns.map((c) => (
                  <td key={c.key}>{c.cell ? c.cell(r) : r[c.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

