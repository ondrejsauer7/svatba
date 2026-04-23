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