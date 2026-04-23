import React from "react";

export const containerStyle: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "24px 14px 60px",
  fontFamily: "system-ui, sans-serif",
};

export const titleStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 18,
  textAlign: "center",
};

export const sectionStyle: React.CSSProperties = {
  marginBottom: 26,
};

export const sectionToggleStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  fontSize: 20,
  fontWeight: 700,
  borderRadius: 14,
  border: "none",
  background: "#f6f7fb",
  cursor: "pointer",
  marginBottom: 10,
};

export const cardStyle: React.CSSProperties = {
  background: "#fff",
  padding: 16,
  borderRadius: 18,
  boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
  marginBottom: 12,
};

export const cardTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  marginBottom: 6,
};

export const primaryButtonStyle: React.CSSProperties = {
  background: "#5b67ff",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
};

export const secondaryButtonStyle: React.CSSProperties = {
  background: "#eef0ff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};

export const dangerButtonStyle: React.CSSProperties = {
  background: "#ffe7e7",
  border: "none",
  padding: "8px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};

export const inputStyle: React.CSSProperties = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
  fontSize: 15,
};

export const statsWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
  gap: 10,
  marginBottom: 14,
};

export const statBoxStyle: React.CSSProperties = {
  background: "#fafbff",
  padding: 12,
  borderRadius: 14,
  fontWeight: 700,
};

export const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginBottom: 6,
};

export const badgeStyle: React.CSSProperties = {
  background: "#eef1ff",
  padding: "4px 8px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 700,
};

export const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 10,
};

export const emptyStyle: React.CSSProperties = {
  opacity: 0.5,
  fontStyle: "italic",
};

export const toastStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 18,
  right: 18,
  background: "#111",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 12,
  fontWeight: 700,
};
