"use client";

import { BarcodeFormat, QRCodeWriter } from "@zxing/library";
import { useField } from "@payloadcms/ui";
import { useMemo } from "react";

const qrSize = 220;

function buildQrSvgPath(value: string) {
  const matrix = new QRCodeWriter().encode(
    value,
    BarcodeFormat.QR_CODE,
    qrSize,
    qrSize,
    new Map(),
  );
  const modules: string[] = [];

  for (let y = 0; y < qrSize; y += 1) {
    for (let x = 0; x < qrSize; x += 1) {
      if (matrix.get(x, y)) {
        modules.push(`M${x} ${y}h1v1H${x}z`);
      }
    }
  }

  return modules.join("");
}

export function QrCodePreview() {
  const { value } = useField<string>({ path: "qrDynamicUrl" });
  const qrValue = typeof value === "string" ? value.trim() : "";
  const qrPath = useMemo(
    () => (qrValue ? buildQrSvgPath(qrValue) : ""),
    [qrValue],
  );

  if (!qrValue) {
    return null;
  }

  return (
    <div style={{ marginTop: "calc(var(--base) * 0.75)" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid var(--theme-elevation-150)",
          borderRadius: "var(--style-radius-s)",
          display: "inline-flex",
          flexDirection: "column",
          gap: "calc(var(--base) * 0.4)",
          padding: "calc(var(--base) * 0.5)",
        }}
      >
        <svg
          aria-label="QR code for dynamic artwork URL"
          height={qrSize}
          role="img"
          viewBox={`0 0 ${qrSize} ${qrSize}`}
          width={qrSize}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect fill="#fff" height={qrSize} width={qrSize} />
          <path d={qrPath} fill="#000" />
        </svg>
        <span
          style={{
            color: "#000",
            fontSize: "12px",
            lineHeight: "16px",
            maxWidth: `${qrSize}px`,
            overflowWrap: "anywhere",
          }}
        >
          {qrValue}
        </span>
      </div>
    </div>
  );
}
