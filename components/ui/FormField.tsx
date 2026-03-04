import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";

interface BaseProps {
  label: string;
  error?: FieldError;
  hint?: string;
}

type InputProps = BaseProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
    textarea?: false;
  };

type TextareaProps = BaseProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className"> & {
    textarea: true;
    rows?: number;
  };

type FormFieldProps = InputProps | TextareaProps;

const inputBaseClass =
  "input input-bordered w-full text-sm disabled:opacity-40";
const textareaBaseClass =
  "textarea textarea-bordered w-full text-sm disabled:opacity-40 resize-none";

export function FormField(props: FormFieldProps) {
  const { label, error, hint, textarea, rows, ...rest } =
    props as TextareaProps;

  const id = typeof rest.id === "string" ? rest.id : (rest.name ?? label);

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="label text-xs font-medium opacity-70">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          rows={rows ?? 3}
          className={[textareaBaseClass, error ? "textarea-error" : ""].join(
            " ",
          )}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          className={[inputBaseClass, error ? "input-error" : ""].join(" ")}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {hint && !error && <p className="text-xs opacity-40 mt-0.5">{hint}</p>}
      {error && (
        <p className="label-text-alt text-error text-xs mt-0.5">
          {error.message}
        </p>
      )}
    </div>
  );
}
