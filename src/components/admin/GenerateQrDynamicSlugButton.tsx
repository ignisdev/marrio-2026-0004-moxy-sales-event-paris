"use client";

import {
  Button,
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
} from "@payloadcms/ui";
import type { TextFieldClientProps } from "payload";
import { useState } from "react";

type GenerateSlugResponse = {
  message?: string;
  slug?: string;
  url?: string;
};

export function GenerateQrDynamicSlugButton(props: TextFieldClientProps) {
  const {
    disabled,
    errorMessage,
    path,
    setValue,
    showError,
    value,
  } = useField<string>({ path: props.path });
  const { setValue: setDynamicUrlValue } = useField<string>({ path: "qrDynamicUrl" });
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputId = `field-${path?.replace(/\./g, "__")}`;
  const isReadOnly = props.readOnly || disabled;
  const description =
    typeof props.field.admin?.description === "string"
      ? props.field.admin.description
      : undefined;
  const placeholder =
    typeof props.field.admin?.placeholder === "string"
      ? props.field.admin.placeholder
      : undefined;

  async function handleGenerate() {
    setError(null);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/admin/qr-dynamic-slug", {
        method: "POST",
      });
      const result = (await response.json()) as GenerateSlugResponse;

      if (!response.ok || !result.slug) {
        setError(result.message || "Could not generate slug.");
        return;
      }

      setValue(result.slug);
      if (result.url) {
        setDynamicUrlValue(result.url);
      }
    } catch {
      setError("Could not generate slug.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className={["field-type", "text", showError && "error"].filter(Boolean).join(" ")}>
      <FieldLabel
        htmlFor={inputId}
        label={props.field.label}
        localized={props.field.localized}
        path={path}
        required={props.field.required}
      />
      <div className="field-type__wrap">
        <FieldError message={errorMessage} path={path} showError={showError} />
        <div style={{ alignItems: "stretch", display: "flex", gap: "0.75rem" }}>
          <input
            autoComplete={props.field.admin?.autoComplete || undefined}
            disabled={isReadOnly}
            id={inputId}
            name={path}
            onChange={(event) => {
              setValue(event.target.value);
            }}
            placeholder={placeholder}
            readOnly={isReadOnly}
            type="text"
            value={value || ""}
          />
          <Button
            buttonStyle={value ? "secondary" : "primary"}
            disabled={isGenerating}
            extraButtonProps={{
              style: {
                height: "calc(var(--base) * 2)",
                minHeight: "calc(var(--base) * 2)",
                whiteSpace: "nowrap",
              },
            }}
            margin={false}
            onClick={handleGenerate}
            size="medium"
            type="button"
          >
            {isGenerating ? "Generating..." : value ? "Regenerate slug" : "Generate slug"}
          </Button>
        </div>
        <FieldDescription description={description} path={path} />
      </div>
      {error ? (
        <p style={{ color: "var(--theme-error-500)", marginBottom: 0 }}>{error}</p>
      ) : null}
    </div>
  );
}
