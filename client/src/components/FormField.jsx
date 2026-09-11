export function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

export function TextInput({ id, value, onChange, error, ...rest }) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`field ${error ? "border-danger focus:border-danger" : ""}`}
      {...rest}
    />
  );
}

export function TextArea({ id, value, onChange, error, rows = 5, ...rest }) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`field resize-y ${error ? "border-danger focus:border-danger" : ""}`}
      {...rest}
    />
  );
}

export function SelectInput({ id, value, onChange, options, error, placeholder }) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`field cursor-pointer ${error ? "border-danger focus:border-danger" : ""}`}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}