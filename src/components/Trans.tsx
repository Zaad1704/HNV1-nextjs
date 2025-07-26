import React from "react";
import { useLang } from "../contexts/LanguageContext";
type Props = { en: React.ReactNode; bn: React.ReactNode; };
export default function Trans({ en, bn }: Props) {
  const { lang } = useLang();
  return <>{lang === "en" ? en : bn}</>;
}
