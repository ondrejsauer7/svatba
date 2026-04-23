import React from "react";

export const containerStyle: React.CSSProperties = {
  padding: 16,
  fontFamily: "Arial, sans-serif",
  maxWidth: 760,
  margin: "0 auto",
};

export const titleStyle: React.CSSProperties = {
  fontSize: 28,
  marginBottom: 12,
};

export const sectionStyle: React.CSSProperties = {
  marginBottom: 28,
};

export const topBarStyle: React.CSSProperties = {
  marginBottom: 16,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
};

export const statusStyle: React.CSSProperties = {
  fontWeight: 600,
};

export const loadingStyle: React.CSSProperties = {
  padding: 24,
  fontFamily: "Arial, sans-serif",
};

export const errorStyle: React.CSSProperties = {
  background: "#ffe5e5",
  color: "#900",
  padding: 12,
  marginBottom: 16,
  border: "1px solid #f0b3b3",
  borderRadius: 10,
};

export const sectionToggleStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fafafa",
  fontWeight: 800,
  fontSize: 20,
  marginBottom: 12,
};

export const statsWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 14,
};

export const statBoxStyle: React.CSSProperties = {
  background: "#f3f3f3",
  padding: "8px 12px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 14,
};

export const formStackStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  marginBottom: 16,
};

export const inputStyle: React.CSSProperties = {
  padding: 12,
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 10,
  border: "1px solid #ccc",
  fontSize: 16,
};

export const checkboxLineStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 600,
};

export const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

export const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  fontWeight: 700,
};

export const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #bbb",
  background: "#f6f6f6",
  fontWeight: 700,
};

export const dangerButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #d99",
  background: "#fff5f5",
  color: "#900",
  fontWeight: 700,
};

export const cardListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

export const cardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 14,
  background: "#fff",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

export const cardTopRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
};

export const cardTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
};

export const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

export const metaGridStyle: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginBottom: 12,
  color: "#333",
};

export const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#eef2ff",
  color: "#334",
  padding: "6px 10px",
  borderRadius: 999,
  fontWeight: 700,
  fontSize: 13,
};

export const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 10,
};

export const emptyStyle: React.CSSProperties = {
  color: "#666",
  padding: 8,
};

export const filterCardStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: 14,
  padding: 14,
  background: "#fafafa",
  marginBottom: 16,
  display: "grid",
  gap: 12,
};

export const filterTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 16,
};

export const chipsWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
};

export const filterLabelStyle: React.CSSProperties = {
  fontWeight: 700,
};

export const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: active ? "1px solid #111" : "1px solid #ccc",
  background: active ? "#111" : "#fff",
  color: active ? "#fff" : "#333",
  fontWeight: 700,
});
export const toastStyle: React.CSSProperties = {
  position: "fixed",
  right: 16,
  bottom: 16,
  background: "#111",
  color: "#fff",
  padding: "12px 14px",
  borderRadius: 12,
  fontWeight: 700,
  zIndex: 1000,
  boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
};

export const textareaStyle: React.CSSProperties = {
  padding: 12,
  width: "100%",
  minHeight: 110,
  boxSizing: "border-box",
  borderRadius: 10,
  border: "1px solid #ccc",
  fontSize: 16,
  fontFamily: "Arial, sans-serif",
  resize: "vertical",
};
