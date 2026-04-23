import React from "react";

export const containerStyle: React.CSSProperties = {
  maxWidth: 1040,
  margin: "0 auto",
  padding: "26px 14px 90px",
  fontFamily: '"DM Sans", "Segoe UI", Arial, sans-serif',
  color: "#1f2937",
  minHeight: "100vh",
};

export const heroStyle: React.CSSProperties = {
  marginBottom: 18,
  padding: "18px 16px",
  borderRadius: 24,
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,249,255,0.9) 55%, rgba(236,253,245,0.9) 100%)",
  boxShadow: "0 22px 44px rgba(15, 23, 42, 0.10)",
  backdropFilter: "blur(8px)",
};

export const titleStyle: React.CSSProperties = {
  fontSize: 38,
  lineHeight: 1.05,
  fontWeight: 800,
  margin: 0,
  marginBottom: 8,
  letterSpacing: "-0.03em",
  color: "#0f172a",
  fontFamily: '"Space Grotesk", "DM Sans", "Segoe UI", Arial, sans-serif',
};

export const heroSubTitleStyle: React.CSSProperties = {
  margin: 0,
  marginBottom: 14,
  color: "#334155",
  fontSize: 15,
  fontWeight: 500,
};

export const heroStatsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
  gap: 10,
};

export const heroStatCardStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.3)",
  background: "rgba(255,255,255,0.75)",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
};

export const heroStatLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#475569",
  fontWeight: 700,
};

export const heroStatValueStyle: React.CSSProperties = {
  margin: 0,
  marginTop: 4,
  fontSize: 21,
  color: "#0f172a",
  fontWeight: 800,
  fontFamily: '"Space Grotesk", "DM Sans", "Segoe UI", Arial, sans-serif',
};

export const sectionStyle: React.CSSProperties = {
  marginBottom: 24,
};

export const topBarStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 14,
  padding: 10,
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background: "rgba(255,255,255,0.86)",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  backdropFilter: "blur(8px)",
};

export const quickNavStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  alignItems: "center",
  marginBottom: 18,
  padding: 10,
  borderRadius: 16,
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background: "rgba(255,255,255,0.86)",
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
  backdropFilter: "blur(8px)",
  position: "sticky",
  top: 8,
  zIndex: 40,
};

export const quickNavButtonStyle = (active: boolean): React.CSSProperties => ({
  border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  color: active ? "#ffffff" : "#334155",
  background: active
    ? "linear-gradient(135deg, #0f172a 0%, #334155 100%)"
    : "rgba(255,255,255,0.9)",
  boxShadow: active ? "0 8px 18px rgba(15,23,42,0.22)" : "none",
});

export const statusStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#334155",
  marginLeft: "auto",
  fontSize: 13,
};

export const loadingStyle: React.CSSProperties = {
  padding: 24,
  fontFamily: '"DM Sans", "Segoe UI", Arial, sans-serif',
  color: "#0f172a",
};

export const errorStyle: React.CSSProperties = {
  background: "#fff1f2",
  color: "#9f1239",
  padding: 12,
  marginBottom: 16,
  border: "1px solid #fecdd3",
  borderRadius: 14,
  fontWeight: 700,
  boxShadow: "0 8px 20px rgba(190, 24, 93, 0.12)",
};

export const sectionToggleStyle: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: "14px 16px",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  fontWeight: 800,
  fontSize: 20,
  marginBottom: 12,
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(15, 23, 42, 0.06)",
  color: "#111827",
};

export const statsWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(148px,1fr))",
  gap: 10,
  marginBottom: 14,
};

export const statBoxStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  padding: "12px 14px",
  borderRadius: 16,
  fontWeight: 700,
  fontSize: 14,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
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
  border: "1px solid #cbd5e1",
  fontSize: 16,
  background: "#ffffff",
  color: "#111827",
  outline: "none",
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 110,
  fontFamily: '"DM Sans", "Segoe UI", Arial, sans-serif',
  resize: "vertical",
};

export const checkboxLineStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  fontWeight: 600,
  background: "#ffffff",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
};

export const buttonRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 10,
};

export const primaryButtonStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
  color: "#ffffff",
  border: "none",
  padding: "10px 16px",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.22)",
};

export const secondaryButtonStyle: React.CSSProperties = {
  background: "#f8fafc",
  color: "#1e293b",
  border: "1px solid #cbd5e1",
  padding: "8px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 6px 14px rgba(15, 23, 42, 0.08)",
};

export const dangerButtonStyle: React.CSSProperties = {
  background: "#fff1f2",
  color: "#9f1239",
  border: "1px solid #fda4af",
  padding: "8px 14px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 6px 14px rgba(190, 24, 93, 0.12)",
};

export const cardListStyle: React.CSSProperties = {
  display: "grid",
  gap: 12,
};

export const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  padding: 16,
  borderRadius: 18,
  boxShadow: "0 12px 28px rgba(15, 23, 42, 0.09)",
  border: "1px solid rgba(148, 163, 184, 0.28)",
  marginBottom: 12,
  backdropFilter: "blur(8px)",
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
  color: "#0f172a",
  letterSpacing: "-0.01em",
  fontFamily: '"Space Grotesk", "DM Sans", "Segoe UI", Arial, sans-serif',
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
  color: "#334155",
  lineHeight: 1.42,
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
  color: "#64748b",
  padding: 8,
  fontStyle: "italic",
};

export const filterCardStyle: React.CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.35)",
  borderRadius: 18,
  padding: 14,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(8px)",
  marginBottom: 16,
  display: "grid",
  gap: 12,
  boxShadow: "0 10px 24px rgba(15, 23, 42, 0.06)",
};

export const filterTitleStyle: React.CSSProperties = {
  fontWeight: 800,
  fontSize: 16,
  color: "#0f172a",
  letterSpacing: "-0.01em",
};

export const chipsWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  alignItems: "center",
};

export const filterLabelStyle: React.CSSProperties = {
  fontWeight: 700,
  color: "#334155",
};

export const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: "8px 12px",
  borderRadius: 999,
  border: active ? "1px solid #0f172a" : "1px solid #cbd5e1",
  background: active
    ? "linear-gradient(135deg, #0f172a 0%, #334155 100%)"
    : "#ffffff",
  color: active ? "#ffffff" : "#334155",
  fontWeight: 700,
  cursor: "pointer",
  boxShadow: active ? "0 8px 18px rgba(15, 23, 42, 0.18)" : "none",
});

export const toastStyle: React.CSSProperties = {
  position: "fixed",
  right: 16,
  bottom: 16,
  background: "#0f172a",
  color: "#ffffff",
  padding: "12px 14px",
  borderRadius: 14,
  fontWeight: 700,
  zIndex: 1000,
  boxShadow: "0 14px 26px rgba(2, 6, 23, 0.35)",
};

