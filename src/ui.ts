import React from "react";

export const containerStyle: React.CSSProperties = {
  maxWidth: 920,
  margin: "0 auto",
  padding: "24px 14px 60px",
  fontFamily: "Inter, system-ui, Arial, sans-serif",
  color: "#1f2937",
  background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
  minHeight: "100vh",
};

export const titleStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  marginBottom: 18,
  textAlign: "center",
  color: "#111827",
};

export const sectionStyle: React.CSSProperties = {
  marginBottom: 26,
};

export const topBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 18,
};

export const statusStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#374151",
};

export const loadingStyle: React.CSSProperties = {
  padding: 24,
  fontFamily: "Inter, system-ui, Arial, sans-serif",
  color: "#111827",
};

export const errorStyle: React.CSSProperties = {
  background: "#fee2e2",
  color: "#991b1b",
  padding: 12,
  marginBottom: 16,
  border: "1px solid #fecaca",
  borderRadius: 12,
  fontWeight: 600,
};

export const sectionToggleStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  fontWeight: 800,
  fontSize: 20,
  marginBottom: 12,
  cursor: "pointer",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  color: "#111827",
};

export const statsWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
  gap: 10,
  marginBottom: 14,
};

export const statBoxStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  padding: "12px 14px",
  borderRadius: 16,
  fontWeight: 700,
  fontSize: 14,
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
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
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 16,
  background: "#ffffff",
  color: "#111827",
  outline: "none",
};

export const textareaStyle: React.CSSProperties = {
  padding: 12,
  width: "100%",
  minHeight: 110,
  boxSizing: "border-box",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  fontSize: 16,
  fontFamily: "Inter, system-ui, Arial, sans-serif",
  resize: "vertical",
  background: "#ffffff",
  color: "#111827",
};

export const checkboxLineStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 600,
  background: "#ffffff",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
};

export const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 10,
};

export const primaryButtonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
  color: "#ffffff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(79, 70, 229, 0.25)",
};

export const secondaryButtonStyle: React.CSSProperties = {
  background: "#eef2ff",
  color: "#3730a3",
  border: "1px solid #c7d2fe",
  padding: "8px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
};

export const dangerButtonStyle: React.CSSProperties = {
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  padding: "8px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
};

export const cardListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

export const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  padding: 16,
  borderRadius: 18,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  border: "1px solid #e5e7eb",
  marginBottom: 12,
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
  fontWeight: 800,
  marginBottom: 6,
  color: "#111827",
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
  color: "#374151",
  lineHeight: 1.4,
};

export const badgeStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#eef2ff",
  color: "#3730a3",
  padding: "5px 9px",
  borderRadius: 999,
  fontWeight: 800,
  fontSize: 12,
  border: "1px solid #c7d2fe",
};

export const badgeRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 10,
};

export const emptyStyle: React.CSSProperties = {
  color: "#6b7280",
  padding: 8,
  fontStyle: "italic",
};

export const filterCardStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(6px)",
  marginBottom: 16,
  display: "grid",
  gap: 12,
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
};

export const filterTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 16,
  color: "#111827",
};

export const chipsWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
};

export const filterLabelStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#374151",
};

export const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: active ? "1px solid #4f46e5" : "1px solid #d1d5db",
  background: active ? "#4f46e5" : "#ffffff",
  color: active ? "#ffffff" : "#374151",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: active ? "0 6px 16px rgba(79, 70, 229, 0.18)" : "none",
});

export const toastStyle: React.CSSProperties = {
  position: "fixed",
  right: 16,
  bottom: 16,
  background: "#111827",
  color: "#ffffff",
  padding: "12px 14px",
  borderRadius: 14,
  fontWeight: 700,
  zIndex: 1000,
  boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
};
